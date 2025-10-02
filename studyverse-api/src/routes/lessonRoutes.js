const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { updateLesson, deleteLesson, markLessonAsComplete } = require('../controllers/lessonController');

// @route   PUT /api/lessons/:id
// @desc    Update a lesson
// @access  Private (Educator)
router.put('/:id', authMiddleware, updateLesson);

// @route   DELETE /api/lessons/:id
// @desc    Delete a lesson
// @access  Private (Educator)
router.delete('/:id', authMiddleware, deleteLesson);

// @route   POST /api/lessons/:id/complete
// @desc    Mark a lesson as complete
// @access  Private
router.post('/:id/complete', authMiddleware, markLessonAsComplete);

module.exports = router;