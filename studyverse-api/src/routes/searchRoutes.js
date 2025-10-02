const express = require('express');
const router = express.Router();
const { searchContent } = require('../controllers/searchController');

// @route   GET /api/search
// @desc    Search for courses and notes
// @access  Public
router.get('/', searchContent);

module.exports = router;