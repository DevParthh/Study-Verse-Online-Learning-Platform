const db = require('../config/db');
const asyncHandler = require('express-async-handler');

// @desc    Get all approved courses
// @route   GET /api/courses
// @access  Public
exports.getAllCourses = async (req, res) => {
    try {
        const courses = await db.query(
            `SELECT c.*, u.name AS teacher_name 
             FROM courses c 
             JOIN users u ON c.teacher_id = u.id 
             WHERE c.status = 'approved'`
        );
        res.json(courses.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// @desc    Get a single course by ID
// @route   GET /api/courses/:id
// @access  Public
exports.getCourseById = async (req, res) => {
    try {
        const courseId = req.params.id;
        const course = await db.query('SELECT * FROM courses WHERE id = $1', [courseId]);

        // Check if the course was found
        if (course.rows.length === 0) {
            return res.status(404).json({ msg: 'Course not found' });
        }

        res.json(course.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// @desc    Get courses created by the logged-in educator
// @route   GET /api/courses/mycourses
// @access  Private
exports.getMyCourses = async (req, res) => {
    try {
        // The user's ID is available from the authMiddleware
        const teacherId = req.user.id;

        const courses = await db.query(
            'SELECT * FROM courses WHERE teacher_id = $1',
            [teacherId]
        );

        res.json(courses.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.createCourse = async (req, res) => {
    try {
        // 1. First layer of security: Role check
        // The authMiddleware has already run and attached the user to req.user
        if (req.user.role !== 'educator') {
            return res.status(403).json({ msg: 'Forbidden: Only educators can create courses' });
        }

        // 2. Get course details from the request body
        const { title, description } = req.body;
        if (!title || !description) {
            return res.status(400).json({ msg: 'Please provide a title and description' });
        }

        // The teacher_id comes from the logged-in user's token
        const teacher_id = req.user.id;

        // 3. Insert the new course into the database
        const newCourse = await db.query(
            'INSERT INTO courses (title, description, teacher_id) VALUES ($1, $2, $3) RETURNING *',
            [title, description, teacher_id]
        );

        res.status(201).json(newCourse.rows[0]);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// @desc    Purchase & enroll a student in a course
// @route   POST /api/courses/:id/enroll
// @access  Private
exports.enrollInCourse = asyncHandler(async (req, res) => {
    const courseId = req.params.id;
    const studentId = req.user.id;

    // --- CRITICAL FIX: CHECK FOR EXISTING ENROLLMENT FIRST ---
    const existingEnrollment = await db.query(
        'SELECT * FROM enrollments WHERE user_id = $1 AND course_id = $2',
        [studentId, courseId]
    );

    if (existingEnrollment.rows.length > 0) {
        res.status(400);
        throw new Error('User is already enrolled in this course');
    }
    // --- END FIX ---

    const client = await db.pool.connect();
    try {
        await client.query('BEGIN'); // Start transaction

        const courseResult = await client.query('SELECT teacher_id, price FROM courses WHERE id = $1', [courseId]);
        if (courseResult.rows.length === 0) {
            throw new Error('Course not found');
        }
        const { teacher_id, price } = courseResult.rows[0];
        const coursePrice = parseFloat(price);

        const studentResult = await client.query('SELECT balance FROM users WHERE id = $1 FOR UPDATE', [studentId]);
        const studentBalance = parseFloat(studentResult.rows[0].balance);

        if (studentBalance < coursePrice) {
            throw new Error('Insufficient funds');
        }

        await client.query('UPDATE users SET balance = balance - $1 WHERE id = $2', [coursePrice, studentId]);
        await client.query('UPDATE users SET balance = balance + $1 WHERE id = $2', [coursePrice, teacher_id]);
        await client.query('INSERT INTO enrollments (user_id, course_id) VALUES ($1, $2)', [studentId, courseId]);

        await client.query('COMMIT');
        res.status(201).json({ msg: `Successfully purchased and enrolled. New balance: ${studentBalance - coursePrice}` });

    } catch (err) {
        await client.query('ROLLBACK');
        res.status(400);
        throw new Error(err.message);
    } finally {
        client.release();
    }
});

// @desc    Update a course
// @route   PUT /api/courses/:id
// @access  Private (Educator only)
exports.updateCourse = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    const courseId = req.params.id;
    const teacherId = req.user.id;

    // 1. Find the course by its ID
    const course = await db.query('SELECT * FROM courses WHERE id = $1', [courseId]);

    if (course.rows.length === 0) {
        res.status(404);
        throw new Error('Course not found');
    }

    // 2. Check if the logged-in user is the owner of the course
    if (course.rows[0].teacher_id !== teacherId) {
        res.status(403); // Forbidden
        throw new Error('User not authorized to update this course');
    }

    // 3. Update the course with new details
    const updatedCourse = await db.query(
        'UPDATE courses SET title = $1, description = $2 WHERE id = $3 RETURNING *',
        [title, description, courseId]
    );

    res.json(updatedCourse.rows[0]);
});

// @desc    Delete a course
// @route   DELETE /api/courses/:id
// @access  Private (Educator only)
exports.deleteCourse = asyncHandler(async (req, res) => {
    const courseId = req.params.id;
    const teacherId = req.user.id;

    // 1. Find the course by its ID
    const course = await db.query('SELECT * FROM courses WHERE id = $1', [courseId]);

    if (course.rows.length === 0) {
        res.status(404);
        throw new Error('Course not found');
    }

    // 2. Check if the logged-in user is the owner of the course
    if (course.rows[0].teacher_id !== teacherId) {
        res.status(403); // Forbidden
        throw new Error('User not authorized to delete this course');
    }

    // 3. Delete the course
    await db.query('DELETE FROM courses WHERE id = $1', [courseId]);

    res.json({ msg: 'Course removed' });
});

// @desc    Add a lesson to a course
// @route   POST /api/courses/:courseId/lessons
// @access  Private (Educator only)
exports.addLessonToCourse = asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    const { title, content, video_url } = req.body;
    const teacherId = req.user.id;

    // 1. Find the course to ensure it exists and the user is the owner
    const course = await db.query('SELECT * FROM courses WHERE id = $1', [courseId]);

    if (course.rows.length === 0) {
        res.status(404);
        throw new Error('Course not found');
    }

    if (course.rows[0].teacher_id !== teacherId) {
        res.status(403);
        throw new Error('User not authorized to add lessons to this course');
    }

    // 2. Determine the position for the new lesson
    const lessonCountResult = await db.query('SELECT COUNT(*) FROM lessons WHERE course_id = $1', [courseId]);
    const position = parseInt(lessonCountResult.rows[0].count) + 1;

    // 3. Insert the new lesson
    const newLesson = await db.query(
        'INSERT INTO lessons (title, content, video_url, course_id, position) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [title, content, video_url, courseId, position]
    );

    res.status(201).json(newLesson.rows[0]);
});

// @desc    Get all lessons for a specific course
// @route   GET /api/courses/:courseId/lessons
// @access  Public
exports.getLessonsForCourse = asyncHandler(async (req, res) => {
    const { courseId } = req.params;

    // Find all lessons for the given course and order them by their position
    const lessons = await db.query(
        'SELECT * FROM lessons WHERE course_id = $1 ORDER BY position ASC',
        [courseId]
    );

    res.json(lessons.rows);
});

// @desc    Rate a course
// @route   POST /api/courses/:id/rate
// @access  Private (Enrolled Students only)
exports.rateCourse = asyncHandler(async (req, res) => {
    const { rating_value } = req.body;
    const courseId = req.params.id;
    const studentId = req.user.id;

    // 1. Validation
    if (!rating_value || rating_value < 1 || rating_value > 5) {
        res.status(400);
        throw new Error('Please provide a rating between 1 and 5.');
    }

    // 2. Check if the student is enrolled in the course
    const enrollment = await db.query(
        'SELECT * FROM enrollments WHERE user_id = $1 AND course_id = $2',
        [studentId, courseId]
    );

    if (enrollment.rows.length === 0) {
        res.status(403);
        throw new Error('You must be enrolled in a course to rate it.');
    }

    // --- Note: A full implementation would prevent a user from rating twice ---
    // For simplicity, we'll allow re-rating, which just updates the average.

    // 3. Get current rating to calculate the new average
    const course = await db.query('SELECT * FROM courses WHERE id = $1', [courseId]);
    const { average_rating, rating_count } = course.rows[0];

    // 4. Calculate new average and count
    const new_rating_count = rating_count + 1;
    const new_average_rating = ((average_rating * rating_count) + rating_value) / new_rating_count;

    // 5. Update the course with the new rating
    const updatedCourse = await db.query(
        'UPDATE courses SET average_rating = $1, rating_count = $2 WHERE id = $3 RETURNING *',
        [new_average_rating, new_rating_count, courseId]
    );

    res.json(updatedCourse.rows[0]);
});

// @desc    Add a comment to a course
// @route   POST /api/courses/:id/comments
// @access  Private (Enrolled users only)
exports.addCommentToCourse = asyncHandler(async (req, res) => {
    const { text } = req.body;
    const courseId = req.params.id;
    const userId = req.user.id;

    // 1. Check if user is enrolled
    const enrollment = await db.query(
        'SELECT * FROM enrollments WHERE user_id = $1 AND course_id = $2',
        [userId, courseId]
    );

    if (enrollment.rows.length === 0) {
        res.status(403);
        throw new Error('You must be enrolled in a course to comment.');
    }

    // 2. Insert the comment
    const newComment = await db.query(
        'INSERT INTO comments (text, user_id, course_id) VALUES ($1, $2, $3) RETURNING *',
        [text, userId, courseId]
    );

    res.status(201).json(newComment.rows[0]);
});

// @desc    Get all comments for a course
// @route   GET /api/courses/:id/comments
// @access  Public
exports.getCommentsForCourse = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const comments = await db.query(
        `SELECT c.id, c.text, c.created_at, u.name AS author_name
         FROM comments c
         JOIN users u ON c.user_id = u.id
         WHERE c.course_id = $1
         ORDER BY c.created_at DESC`,
        [id]
    );

    res.json(comments.rows);
});