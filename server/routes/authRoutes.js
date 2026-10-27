const express = require('express');
const router = express.Router();
const { signup, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public authentication routes
router.post('/signup', signup);
router.post('/login', login);

// Protected route to test JWT & get logged-in user profile
router.get('/me', protect, getMe);

module.exports = router;
