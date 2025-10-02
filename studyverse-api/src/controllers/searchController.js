const db = require('../config/db');
const asyncHandler = require('express-async-handler');

// This is the original combined search function, we can leave it for now.
exports.searchContent = asyncHandler(async (req, res) => {
    const searchTerm = req.query.q;
    if (!searchTerm) {
        res.status(400);
        throw new Error('Please provide a search term');
    }
    const searchQuery = `%${searchTerm}%`;

    const [courseResults, noteResults] = await Promise.all([
        db.query(
            "SELECT * FROM courses WHERE status = 'approved' AND (title ILIKE $1 OR description ILIKE $1)",
            [searchQuery]
        ),
        db.query(
            'SELECT * FROM notes WHERE title ILIKE $1 OR description ILIKE $1',
            [searchQuery]
        )
    ]);

    res.json({
        courses: courseResults.rows,
        notes: noteResults.rows,
    });
});

// <<< --- NEW FUNCTION FOR COURSES --- >>>
exports.searchCourses = asyncHandler(async (req, res) => {
    const searchTerm = req.query.q;
    if (!searchTerm) {
        return res.json([]); // Return empty array if no query
    }
    const searchQuery = `%${searchTerm}%`;
    const courseResults = await db.query(
        "SELECT * FROM courses WHERE status = 'approved' AND (title ILIKE $1 OR description ILIKE $1)",
        [searchQuery]
    );
    res.json(courseResults.rows);
});

// <<< --- NEW FUNCTION FOR NOTES --- >>>
exports.searchNotes = asyncHandler(async (req, res) => {
    const searchTerm = req.query.q;
    if (!searchTerm) {
        return res.json([]); // Return empty array if no query
    }
    const searchQuery = `%${searchTerm}%`;
    const noteResults = await db.query(
        'SELECT * FROM notes WHERE course_id IS NULL AND (title ILIKE $1 OR description ILIKE $1)',
        [searchQuery]
    );
    res.json(noteResults.rows);
});