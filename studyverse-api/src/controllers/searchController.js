const db = require('../config/db');
const asyncHandler = require('express-async-handler');

// @desc    Search for courses and notes
// @route   GET /api/search?q=keyword
// @access  Public
exports.searchContent = asyncHandler(async (req, res) => {
    const searchTerm = req.query.q;

    if (!searchTerm) {
        res.status(400);
        throw new Error('Please provide a search term');
    }

    // Use ILIKE for case-insensitive search. The '%' is a wildcard.
    const searchQuery = `%${searchTerm}%`;

    // We run two queries in parallel for efficiency using Promise.all
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