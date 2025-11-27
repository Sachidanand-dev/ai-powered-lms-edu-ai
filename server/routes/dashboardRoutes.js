const express = require('express');
const router = express.Router();
const { getStudentDashboard, getAdminDashboard } = require('../controllers/dashboardController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/student', protect, getStudentDashboard);
router.get('/admin', protect, admin, getAdminDashboard);

module.exports = router;
