const express = require('express');
const router = express.Router();
const { uploadPDF, chatWithAI, generateQuiz, getChatHistory, clearChatHistory } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../config/upload');

router.post('/upload', protect, upload.single('pdf'), uploadPDF);
router.post('/chat', protect, chatWithAI);
router.get('/chat-history', protect, getChatHistory);
router.post('/quiz', protect, generateQuiz);
router.delete('/chat-history', protect, clearChatHistory);

module.exports = router;
