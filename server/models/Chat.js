const mongoose = require('mongoose');

const chatSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    messages: [
        {
            role: {
                type: String,
                enum: ['user', 'model', 'system'],
                required: true,
            },
            content: {
                type: String,
                required: true,
            },
            timestamp: {
                type: Date,
                default: Date.now,
            },
        },
    ],
}, {
    timestamps: true,
});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
