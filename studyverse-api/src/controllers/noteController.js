const asyncHandler = require('express-async-handler');
const db = require('../config/db');

// (The uploadNote function is at the top)
exports.uploadNote = asyncHandler(async (req, res) => {
    // req.files will be an object e.g., { noteFile: [file1], previewImage: [file2] }
    if (!req.files || !req.files.noteFile) {
        res.status(400);
        throw new Error('Please include a note file to upload.');
    }

    const noteFile = req.files.noteFile[0];
    const previewImage = req.files.previewImage ? req.files.previewImage[0] : null;

    const file_url = noteFile.path.replace(/\\/g, "/");
    const image_url = previewImage ? previewImage.path.replace(/\\/g, "/") : null;

    const { title, description, price, course_id } = req.body;
    const uploader_id = req.user.id;

    if (!title || !file_url) {
        res.status(400).json({ msg: 'Please provide a title and a file.' });
    }

    const newNote = await db.query(
        'INSERT INTO notes (title, description, file_url, image_url, price, uploader_id, course_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [title, description, file_url, image_url, price || 0.00, uploader_id, course_id]
    );

    res.status(201).json(newNote.rows[0]);
});

// <<< --- NEW FUNCTION START --- >>>
// @desc    Get a single note by ID
// @route   GET /api/notes/:id
// @access  Public
exports.getNoteById = asyncHandler(async (req, res) => {
    const noteId = req.params.id;
    const note = await db.query('SELECT * FROM notes WHERE id = $1', [noteId]);
    if (note.rows.length === 0) {
        res.status(404);
        throw new Error('Note not found');
    }
    res.json(note.rows[0]);
});
// <<< --- NEW FUNCTION END --- >>>


// (The rest of the functions are unchanged)
exports.getReviewsForNote = asyncHandler(async (req, res) => {
    const noteId = req.params.id;
    const reviews = await db.query(
        `SELECT r.rating_value, r.review, r.created_at, u.name AS author_name
         FROM note_ratings r
         JOIN users u ON r.user_id = u.id
         WHERE r.note_id = $1
         ORDER BY r.created_at DESC`,
        [noteId]
    );
    res.json(reviews.rows);
});

exports.getNotesForCourse = asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    const notes = await db.query('SELECT * FROM notes WHERE course_id = $1 ORDER BY created_at DESC', [courseId]);
    res.json(notes.rows);
});

exports.rateNote = asyncHandler(async (req, res) => {
    const { rating_value, review } = req.body;
    const noteId = req.params.id;
    const userId = req.user.id;
    if (!rating_value || rating_value < 1 || rating_value > 5) {
        res.status(400); throw new Error('Please provide a rating between 1 and 5.');
    }
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');
        await client.query(
            `INSERT INTO note_ratings (note_id, user_id, rating_value, review) VALUES ($1, $2, $3, $4)
             ON CONFLICT (note_id, user_id) DO UPDATE SET rating_value = EXCLUDED.rating_value, review = EXCLUDED.review`,
            [noteId, userId, rating_value, review]
        );
        const ratingStats = await client.query('SELECT AVG(rating_value)::numeric(10,2) as avg_rating, COUNT(id) as rating_count FROM note_ratings WHERE note_id = $1', [noteId]);
        const { avg_rating, rating_count } = ratingStats.rows[0];
        await client.query('UPDATE notes SET average_rating = $1, rating_count = $2 WHERE id = $3', [avg_rating, rating_count, noteId]);
        await client.query('COMMIT');
        res.json({ msg: 'Note rated successfully', average_rating: avg_rating });
    } catch (err) {
        await client.query('ROLLBACK'); throw err;
    } finally {
        client.release();
    }
});

exports.getStandaloneNotes = asyncHandler(async (req, res) => {
    const notes = await db.query('SELECT * FROM notes WHERE course_id IS NULL ORDER BY created_at DESC');
    res.json(notes.rows);
});

exports.purchaseNote = asyncHandler(async (req, res) => {
    const noteId = req.params.id;
    const buyerId = req.user.id;
    const existingPurchase = await db.query('SELECT * FROM note_purchases WHERE user_id = $1 AND note_id = $2', [buyerId, noteId]);
    if (existingPurchase.rows.length > 0) {
        res.status(400); throw new Error('You already own this note');
    }
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');
        const noteResult = await client.query('SELECT uploader_id, price FROM notes WHERE id = $1', [noteId]);
        if (noteResult.rows.length === 0) { throw new Error('Note not found'); }
        const { uploader_id, price } = noteResult.rows[0];
        const notePrice = parseFloat(price);
        if (uploader_id === buyerId) { throw new Error('You cannot buy your own note'); }
        const buyerResult = await client.query('SELECT balance FROM users WHERE id = $1 FOR UPDATE', [buyerId]);
        const buyerBalance = parseFloat(buyerResult.rows[0].balance);
        if (buyerBalance < notePrice) { throw new Error('Insufficient funds'); }
        await client.query('UPDATE users SET balance = balance - $1 WHERE id = $2', [notePrice, buyerId]);
        await client.query('UPDATE users SET balance = balance + $1 WHERE id = $2', [notePrice, uploader_id]);
        await client.query('INSERT INTO note_purchases (user_id, note_id) VALUES ($1, $2)', [buyerId, noteId]);
        await client.query('COMMIT');
        res.status(201).json({ msg: `Successfully purchased note. New balance: ${buyerBalance - notePrice}` });
    } catch (err) {
        await client.query('ROLLBACK'); res.status(400); throw new Error(err.message);
    } finally {
        client.release();
    }
});