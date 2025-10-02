const db = require('../config/db');
const asyncHandler = require('express-async-handler');

// @desc    Update a lesson
// @route   PUT /api/lessons/:id
// @access  Private (Educator only)
exports.updateLesson = asyncHandler(async (req, res) => {
    const { title, content, video_url } = req.body;
    const lessonId = req.params.id;
    const teacherId = req.user.id;

    // 1. Find the lesson and its parent course to verify ownership
    const lesson = await db.query(
        `SELECT l.*, c.teacher_id FROM lessons l
         JOIN courses c ON l.course_id = c.id
         WHERE l.id = $1`,
        [lessonId]
    );

    if (lesson.rows.length === 0) {
        res.status(404);
        throw new Error('Lesson not found');
    }

    // 2. Check if the logged-in user is the owner of the course this lesson belongs to
    if (lesson.rows[0].teacher_id !== teacherId) {
        res.status(403);
        throw new Error('User not authorized to update this lesson');
    }

    // 3. Update the lesson
    const updatedLesson = await db.query(
        'UPDATE lessons SET title = $1, content = $2, video_url = $3 WHERE id = $4 RETURNING *',
        [title, content, video_url, lessonId]
    );

    res.json(updatedLesson.rows[0]);
});

// @desc    Delete a lesson
// @route   DELETE /api/lessons/:id
// @access  Private (Educator only)
exports.deleteLesson = asyncHandler(async (req, res) => {
    const lessonId = req.params.id;
    const teacherId = req.user.id;

    // 1. Find the lesson to verify ownership before deleting
    const lesson = await db.query(
        `SELECT l.*, c.teacher_id FROM lessons l
         JOIN courses c ON l.course_id = c.id
         WHERE l.id = $1`,
        [lessonId]
    );

    if (lesson.rows.length === 0) {
        res.status(404);
        throw new Error('Lesson not found');
    }

    if (lesson.rows[0].teacher_id !== teacherId) {
        res.status(403);
        throw new Error('User not authorized to delete this lesson');
    }

    // 2. Delete the lesson
    await db.query('DELETE FROM lessons WHERE id = $1', [lessonId]);

    res.json({ msg: 'Lesson removed' });
});

// @desc    Mark a lesson as complete
// @route   POST /api/lessons/:id/complete
// @access  Private (Enrolled users only)
exports.markLessonAsComplete = asyncHandler(async (req, res) => {
    const lessonId = req.params.id;
    const userId = req.user.id;

    // 1. Get the course_id from the lesson
    const lesson = await db.query('SELECT course_id FROM lessons WHERE id = $1', [lessonId]);
    if (lesson.rows.length === 0) {
        res.status(404);
        throw new Error('Lesson not found');
    }
    const { course_id } = lesson.rows[0];

    // 2. Check if the user is enrolled in the parent course
    const enrollment = await db.query(
        'SELECT * FROM enrollments WHERE user_id = $1 AND course_id = $2',
        [userId, course_id]
    );
    if (enrollment.rows.length === 0) {
        res.status(403);
        throw new Error('You must be enrolled in the course to complete its lessons.');
    }

    // 3. Insert the completion record. "ON CONFLICT" prevents duplicates.
    await db.query(
        'INSERT INTO lesson_completions (user_id, lesson_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [userId, lessonId]
    );

    res.status(201).json({ msg: 'Lesson marked as complete' });
});