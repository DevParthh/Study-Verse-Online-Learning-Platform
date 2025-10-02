const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const { 
    createCourse, 
    getAllCourses, 
    getCourseById, 
    getMyCourses,  
    enrollInCourse, 
    updateCourse,
    deleteCourse,
    addLessonToCourse,
    getLessonsForCourse,
    rateCourse,
    addCommentToCourse,
    getCommentsForCourse
 } = require('../controllers/courseController');

// GET all approved courses (Public)
router.get('/', getAllCourses);

// GET an educator's own courses (Private, Educator) <<< NEW LINE
router.get('/mycourses', authMiddleware, getMyCourses);

// GET a single course by ID (Public)
router.get('/:id', getCourseById);

// POST a new course (Private, Educator)
router.post('/', authMiddleware, createCourse);

// POST to enroll in a course (Private, Student) <<< NEW LINE
router.post('/:id/enroll', authMiddleware, enrollInCourse);

// @route   PUT /api/courses/:id
// @desc    Update a course
// @access  Private (Educator)
router.put('/:id', authMiddleware, updateCourse);

// @route   DELETE /api/courses/:id
// @desc    Delete a course
// @access  Private (Educator)
router.delete('/:id', authMiddleware, deleteCourse);

// @route   GET /api/courses/:courseId/lessons
// @desc    Get all lessons for a course
// @access  Public
router.get('/:courseId/lessons', getLessonsForCourse);

// @route   POST /api/courses/:courseId/lessons
// @desc    Add a lesson to a course
// @access  Private (Educator)
router.post('/:courseId/lessons', authMiddleware, addLessonToCourse);

// @route   POST /api/courses/:id/rate
// @desc    Rate a course
// @access  Private (Student)
router.post('/:id/rate', authMiddleware, rateCourse);

// @route   GET /api/courses/:id/comments
// @desc    Get all comments for a course
// @access  Public
router.get('/:id/comments', getCommentsForCourse);

// @route   POST /api/courses/:id/comments
// @desc    Add a comment to a course
// @access  Private
router.post('/:id/comments', authMiddleware, addCommentToCourse); 

module.exports = router;