const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const authMiddleware = require('../middleware/authMiddleware');
const { uploadNote, getNotesForCourse, rateNote, getStandaloneNotes, purchaseNote, getReviewsForNote, getNoteById } = require('../controllers/noteController');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({ storage: storage });

// General routes
router.get('/', getStandaloneNotes);

// THIS IS THE UPDATED UPLOAD ROUTE
router.post(
    '/', 
    authMiddleware, 
    upload.fields([
        { name: 'noteFile', maxCount: 1 },
        { name: 'previewImage', maxCount: 1 }
    ]), 
    uploadNote
);

// Routes with a specific structure first
router.get('/course/:courseId', getNotesForCourse);

// Routes with an ID
router.get('/:id', getNoteById);
router.get('/:id/reviews', getReviewsForNote);
router.post('/:id/rate', authMiddleware, rateNote);
router.post('/:id/purchase', authMiddleware, purchaseNote);

module.exports = router;