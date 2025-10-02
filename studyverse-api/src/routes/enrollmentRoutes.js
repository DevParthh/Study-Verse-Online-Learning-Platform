const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getMyEnrollments } = require('../controllers/enrollmentController');

// @route   GET /api/enrollments/my-enrollments
// @desc    Get all courses a user is enrolled in
// @access  Private
router.get('/my-enrollments', authMiddleware, getMyEnrollments);

module.exports = router;