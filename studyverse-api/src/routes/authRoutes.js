const express = require('express');
const router = express.Router();
const { check } = require('express-validator');

// Import the controllers
const { registerUser, loginUser } = require('../controllers/authController');

// @route   POST /api/auth/register
router.post(
    '/register',
    [
        // Validation rules are defined here as middleware
        check('name', 'Name is required').not().isEmpty(),
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
    ],
    registerUser
);

// @route   POST /api/auth/login
router.post('/login', loginUser);

module.exports = router;