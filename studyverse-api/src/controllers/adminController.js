const db = require('../config/db');
const asyncHandler = require('express-async-handler');
const cloudinary = require('../config/cloudinary'); 

// @desc    Approve or reject a course
// @route   PATCH /api/admin/courses/:id/status
// @access  Private (Admin only)
exports.approveOrRejectCourse = asyncHandler(async (req, res) => {
    // 1. First, verify the user is an admin
    if (req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Forbidden: Admin access required');
    }

    const { status } = req.body;
    const { id } = req.params;

    // 2. Validate the incoming status
    if (status !== 'approved' && status !== 'rejected') {
        res.status(400);
        throw new Error('Invalid status. Must be "approved" or "rejected".');
    }

    // 3. Update the course status in the database
    const updatedCourse = await db.query(
        'UPDATE courses SET status = $1 WHERE id = $2 RETURNING *',
        [status, id]
    );

    if (updatedCourse.rows.length === 0) {
        res.status(404);
        throw new Error('Course not found');
    }

    res.json(updatedCourse.rows[0]);
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin only)
exports.getAllUsers = asyncHandler(async (req, res) => {
    // 1. Verify the user is an admin
    if (req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Forbidden: Admin access required');
    }

    // 2. Fetch all users from the database
    // We explicitly select columns to avoid exposing the password hash
    const users = await db.query(
        'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC'
    );

    res.json(users.rows);
});

// @desc    Delete a note as an admin
// @route   DELETE /api/admin/notes/:id
// @access  Private (Admin only)
exports.deleteNoteAsAdmin = asyncHandler(async (req, res) => {
    // 1. Verify the user is an admin
    if (req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Forbidden: Admin access required');
    }

    const { id } = req.params;

    // 2. Find the note to get its Cloudinary public_id
    const note = await db.query('SELECT * FROM notes WHERE id = $1', [id]);
    if (note.rows.length === 0) {
        res.status(404);
        throw new Error('Note not found');
    }

    // 3. Delete the file from Cloudinary
    const fileUrl = note.rows[0].file_url;
    // Extract the public_id from the URL. Example: .../studyverse_notes/12345-myfile.pdf -> studyverse_notes/12345-myfile
    const publicId = fileUrl.split('/').slice(-2).join('/').split('.')[0];
    await cloudinary.uploader.destroy(publicId);

    // 4. Delete the note record from the database
    await db.query('DELETE FROM notes WHERE id = $1', [id]);

    res.json({ msg: 'Note removed by admin' });
});