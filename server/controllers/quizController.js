const QuizResult = require('../models/QuizResult');

// @desc    Save quiz result
// @route   POST /api/quiz/save
// @access  Private
const saveQuizResult = async (req, res) => {
    const { topic, score, totalQuestions } = req.body;

    try {
        const quizResult = await QuizResult.create({
            user: req.user._id,
            topic,
            score,
            totalQuestions,
        });

        res.status(201).json(quizResult);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error saving quiz result' });
    }
};

// @desc    Get student quiz results
// @route   GET /api/quiz/history
// @access  Private
const getStudentResults = async (req, res) => {
    try {
        const results = await QuizResult.find({ user: req.user._id }).sort({ date: -1 });
        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching quiz history' });
    }
};

module.exports = { saveQuizResult, getStudentResults };
