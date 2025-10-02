const express = require('express');
const router = express.Router();
const { searchContent, searchCourses, searchNotes } = require('../controllers/searchController');

// @route   GET /api/search
// @desc    Search for both courses and notes (old route)
// @access  Public
router.get('/', searchContent);

// @route   GET /api/search/courses
// @desc    Search for courses only
// @access  Public
router.get('/courses', searchCourses);

// @route   GET /api/search/notes
// @desc    Search for notes only
// @access  Public
router.get('/notes', searchNotes);

module.exports = router;