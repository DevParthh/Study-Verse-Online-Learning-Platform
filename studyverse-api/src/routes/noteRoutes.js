const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const authMiddleware = require('../middleware/authMiddleware');
const { uploadNote, getNotesForCourse, rateNote, getStandaloneNotes, purchaseNote } = require('../controllers/noteController');

// Configure Multer to use Cloudinary for storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'studyverse_notes', // Folder name in your Cloudinary account
        allowed_formats: ['pdf', 'jpg', 'png'],
        // public_id is for setting the file name
        public_id: (req, file) => Date.now() + '-' + file.originalname,
    },
});

const upload = multer({ storage: storage });


// @route   GET /api/notes
// @desc    Get all standalone notes
// @access  Public
router.get('/', getStandaloneNotes);

// @route   POST /api/notes
// @desc    Upload a note for a course
// @access  Private
router.post('/', authMiddleware, upload.single('noteFile'), uploadNote);

// @route   GET /api/notes/course/:courseId
// @desc    Get all notes for a specific course
// @access  Public
router.get('/course/:courseId', getNotesForCourse);

// @route   POST /api/notes/:id/rate
// @desc    Rate a note
// @access  Private
router.post('/:id/rate', authMiddleware, rateNote);

// @route   POST /api/notes/:id/purchase
// @desc    Purchase a note
// @access  Private
router.post('/:id/purchase', authMiddleware, purchaseNote);

module.exports = router;