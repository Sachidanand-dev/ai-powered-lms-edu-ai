const express = require('express');
const router = express.Router();
const { saveQuizResult, getStudentResults } = require('../controllers/quizController');
const { protect } = require('../middleware/authMiddleware');

router.post('/save', protect, saveQuizResult);
router.get('/history', protect, getStudentResults);

module.exports = router;
