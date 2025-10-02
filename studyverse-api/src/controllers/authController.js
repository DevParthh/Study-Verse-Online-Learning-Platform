const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const { validationResult } = require('express-validator');

// @desc    Register a new user
// @route   POST /api/auth/register
exports.registerUser = asyncHandler(async (req, res) => {
    // Validation check remains the same
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400); // Set status code before sending response
        throw new Error('Validation failed'); // This will be caught by the error handler
    }

    const { name, email, password, role } = req.body;

    // The try...catch block is no longer needed
    const userExists = await db.query('SELECT * FROM users WHERE email = $1', [email]);

    if (userExists.rows.length > 0) {
        res.status(400);
        throw new Error('User with this email already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const newUser = await db.query(
        'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, email, role',
        [name, email, password_hash, role || 'student']
    );

    res.status(201).json({
        msg: 'User registered successfully!',
        user: newUser.rows[0],
    });
});

// @desc    Authenticate a user & get token
// @route   POST /api/auth/login
exports.loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // 1. Check if user exists
    const user = await db.query('SELECT * FROM users WHERE email = $1', [email]);

    if (user.rows.length === 0) {
        res.status(401); // Unauthorized
        throw new Error('Invalid credentials');
    }

    // 2. Compare password with the stored hash
    const isMatch = await bcrypt.compare(password, user.rows[0].password_hash);

    if (!isMatch) {
        res.status(401); // Unauthorized
        throw new Error('Invalid credentials');
    }

    // 3. User is valid, create a JWT
    const payload = {
        user: {
            id: user.rows[0].id,
            role: user.rows[0].role,
        },
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '5h',
    });

    res.json({ token });
});