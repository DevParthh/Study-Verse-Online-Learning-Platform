const db = require('../config/db');

// @desc    Get all courses a user is enrolled in
// @route   GET /api/enrollments/my-enrollments
// @access  Private
exports.getMyEnrollments = async (req, res) => {
    try {
        const studentId = req.user.id; // From authMiddleware

        const enrolledCourses = await db.query(
            `SELECT c.* FROM courses c
             JOIN enrollments e ON c.id = e.course_id
             WHERE e.user_id = $1`,
            [studentId]
        );

        res.json(enrolledCourses.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};