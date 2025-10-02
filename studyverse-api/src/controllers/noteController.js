const db = require('../config/db');
const asyncHandler = require('express-async-handler');

// @desc    Upload a note for a course
// @route   POST /api/notes
// @access  Private
exports.uploadNote = asyncHandler(async (req, res) => {
    try {
        // course_id is now optional
        const { title, description, course_id } = req.body; 
        const file_url = req.file.path;
        const uploader_id = req.user.id;

        // Updated validation: course_id is no longer required
        if (!title || !file_url) {
            return res.status(400).json({ msg: 'Please provide a title and a file.' });
        }

        // The database will insert NULL if course_id is not provided
        const newNote = await db.query(
            'INSERT INTO notes (title, description, file_url, uploader_id, course_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [title, description, file_url, uploader_id, course_id]
        );

        res.status(201).json(newNote.rows[0]);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @desc    Get all notes for a specific course
// @route   GET /api/notes/course/:courseId
// @access  Public
exports.getNotesForCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const notes = await db.query(
            'SELECT * FROM notes WHERE course_id = $1 ORDER BY created_at DESC',
            [courseId]
        );
        res.json(notes.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// @desc    Rate a note
// @route   POST /api/notes/:id/rate
// @access  Private
exports.rateNote = asyncHandler(async (req, res) => {
    const { rating_value, review } = req.body;
    const noteId = req.params.id;
    const userId = req.user.id;

    // 1. Basic Validation
    if (!rating_value || rating_value < 1 || rating_value > 5) {
        res.status(400);
        throw new Error('Please provide a rating between 1 and 5.');
    }

    // --- Database Transaction Starts Here ---
    const client = await db.pool.connect(); // Get a client from the pool
    try {
        await client.query('BEGIN'); // Start transaction

        // 2. Insert or update the user's rating in the 'note_ratings' table
        // "ON CONFLICT" is a powerful PostgreSQL feature to handle both cases
        await client.query(
            `INSERT INTO note_ratings (note_id, user_id, rating_value, review)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (note_id, user_id)
             DO UPDATE SET rating_value = EXCLUDED.rating_value, review = EXCLUDED.review`,
            [noteId, userId, rating_value, review]
        );

        // 3. Recalculate the average rating and count for the note
        const ratingStats = await client.query(
            'SELECT AVG(rating_value)::numeric(10,2) as avg_rating, COUNT(id) as rating_count FROM note_ratings WHERE note_id = $1',
            [noteId]
        );

        const { avg_rating, rating_count } = ratingStats.rows[0];

        // 4. Update the 'notes' table with the new average and count
        await client.query(
            'UPDATE notes SET average_rating = $1, rating_count = $2 WHERE id = $3',
            [avg_rating, rating_count, noteId]
        );

        await client.query('COMMIT'); // Commit transaction
        res.json({ msg: 'Note rated successfully', average_rating: avg_rating });

    } catch (err) {
        await client.query('ROLLBACK'); // Rollback on error
        throw err; // Pass error to the centralized error handler
    } finally {
        client.release(); // Release client back to the pool
    }
});

// @desc    Get all standalone notes
// @route   GET /api/notes
// @access  Public
exports.getStandaloneNotes = asyncHandler(async (req, res) => {
    // Fetch all notes where the course_id is not set (is NULL)
    const notes = await db.query(
        'SELECT * FROM notes WHERE course_id IS NULL ORDER BY created_at DESC'
    );
    res.json(notes.rows);
});

// @desc    Purchase a note
// @route   POST /api/notes/:id/purchase
// @access  Private
exports.purchaseNote = asyncHandler(async (req, res) => {
    const noteId = req.params.id;
    const buyerId = req.user.id;

    // 1. Check if user already owns the note
    const existingPurchase = await db.query(
        'SELECT * FROM note_purchases WHERE user_id = $1 AND note_id = $2',
        [buyerId, noteId]
    );

    if (existingPurchase.rows.length > 0) {
        res.status(400);
        throw new Error('You already own this note');
    }

    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        const noteResult = await client.query('SELECT uploader_id, price FROM notes WHERE id = $1', [noteId]);
        if (noteResult.rows.length === 0) {
            throw new Error('Note not found');
        }
        const { uploader_id, price } = noteResult.rows[0];
        const notePrice = parseFloat(price);

        if (uploader_id === buyerId) {
            throw new Error('You cannot buy your own note');
        }

        const buyerResult = await client.query('SELECT balance FROM users WHERE id = $1 FOR UPDATE', [buyerId]);
        const buyerBalance = parseFloat(buyerResult.rows[0].balance);

        if (buyerBalance < notePrice) {
            throw new Error('Insufficient funds');
        }

        // Perform transaction
        await client.query('UPDATE users SET balance = balance - $1 WHERE id = $2', [notePrice, buyerId]);
        await client.query('UPDATE users SET balance = balance + $1 WHERE id = $2', [notePrice, uploader_id]);
        await client.query('INSERT INTO note_purchases (user_id, note_id) VALUES ($1, $2)', [buyerId, noteId]);

        await client.query('COMMIT');
        res.status(201).json({ msg: `Successfully purchased note. New balance: ${buyerBalance - notePrice}` });

    } catch (err) {
        await client.query('ROLLBACK');
        res.status(400);
        throw new Error(err.message);
    } finally {
        client.release();
    }
});