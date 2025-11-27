const mongoose = require('mongoose');

const quizResultSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    topic: {
        type: String,
        required: true,
    },
    score: {
        type: Number,
        required: true,
    },
    totalQuestions: {
        type: Number,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('QuizResult', quizResultSchema);
