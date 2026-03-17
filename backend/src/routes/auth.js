const express = require('express');
const { register, login, getMe, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect }                = require('../middleware/auth');
const { validateRegister, validateLogin } = require('../middleware/validate');

const router = express.Router();

// Public routes
router.post('/register', validateRegister, register);
router.post('/login',    validateLogin,    login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Protected route – returns the logged-in user's profile
router.get('/me', protect, getMe);

module.exports = router;
