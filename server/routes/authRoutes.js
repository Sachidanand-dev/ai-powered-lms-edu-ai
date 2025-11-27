const express = require('express');
const router = express.Router();
const { authUser, registerUser, verifyOtp, updateUserProfile } = require('../controllers/authController');

router.post('/login', authUser);
router.post('/register', registerUser);
router.post('/verify-otp', verifyOtp);
router.put('/profile', require('../middleware/authMiddleware').protect, updateUserProfile);

module.exports = router;
