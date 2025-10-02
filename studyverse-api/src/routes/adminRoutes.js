const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { approveOrRejectCourse, getAllUsers, deleteNoteAsAdmin } = require('../controllers/adminController');

// @route   PATCH /api/admin/courses/:id/status
// @desc    Approve or reject a course
// @access  Private (Admin)
router.patch('/courses/:id/status', authMiddleware, approveOrRejectCourse);

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private (Admin)
router.get('/users', authMiddleware, getAllUsers); 

// @route   DELETE /api/admin/notes/:id
// @desc    Delete a note as an admin
// @access  Private (Admin)
router.delete('/notes/:id', authMiddleware, deleteNoteAsAdmin);

module.exports = router;