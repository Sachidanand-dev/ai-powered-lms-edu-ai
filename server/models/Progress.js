const mongoose = require('mongoose');

const progressSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Course',
    },
    completedLessons: {
        type: Number,
        default: 0,
    },
    isCompleted: {
        type: Boolean,
        default: false,
    },
    quizScores: [{
        quizId: String,
        score: Number,
        date: { type: Date, default: Date.now }
    }]
}, {
    timestamps: true,
});

const Progress = mongoose.model('Progress', progressSchema);

module.exports = Progress;
