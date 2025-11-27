const mongoose = require('mongoose');

const courseSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    image: {
        type: String, // CSS class for gradient or image URL
        default: 'bg-gradient-to-br from-blue-500 to-purple-600',
    },
    lessons: [{
        title: { type: String, required: true },
        content: { type: String }, // Could be text or URL
        duration: { type: String }, // e.g., "10 mins"
    }],
    totalLessons: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});

// Pre-save hook to calculate totalLessons
courseSchema.pre('save', function(next) {
    if (this.lessons) {
        this.totalLessons = this.lessons.length;
    }
    next();
});

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
