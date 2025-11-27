const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Course = require('./models/Course');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const importData = async () => {
    try {
        await Course.deleteMany();

        const courses = [
            {
                title: 'Introduction to AI',
                description: 'Learn the basics of Artificial Intelligence and Machine Learning.',
                image: 'bg-gradient-to-br from-blue-500 to-purple-600',
                lessons: [
                    { title: 'What is AI?', content: 'Intro content...', duration: '10 mins' },
                    { title: 'History of AI', content: 'History content...', duration: '15 mins' },
                    { title: 'Machine Learning Basics', content: 'ML content...', duration: '20 mins' },
                ],
            },
            {
                title: 'Advanced React Patterns',
                description: 'Master advanced concepts in React development.',
                image: 'bg-gradient-to-br from-purple-500 to-pink-600',
                lessons: [
                    { title: 'Higher Order Components', content: 'HOC content...', duration: '12 mins' },
                    { title: 'Render Props', content: 'Render props content...', duration: '15 mins' },
                    { title: 'Custom Hooks', content: 'Hooks content...', duration: '18 mins' },
                ],
            },
            {
                title: 'Node.js Microservices',
                description: 'Build scalable microservices with Node.js.',
                image: 'bg-gradient-to-br from-orange-400 to-red-500',
                lessons: [
                    { title: 'Microservices Architecture', content: 'Arch content...', duration: '20 mins' },
                    { title: 'Docker & Kubernetes', content: 'Container content...', duration: '25 mins' },
                ],
            },
        ];

        await Course.insertMany(courses);

        console.log('Data Imported!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

importData();
