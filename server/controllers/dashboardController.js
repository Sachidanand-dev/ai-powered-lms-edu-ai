const Course = require('../models/Course');
const Progress = require('../models/Progress');
const User = require('../models/User');

// @desc    Get student dashboard data
// @route   GET /api/dashboard/student
// @access  Private (Student)
const getStudentDashboard = async (req, res) => {
    try {
        const userId = req.user._id;

        // Get all courses (for now, assume all courses are available to everyone)
        // In a real app, we might filter by enrollment
        const allCourses = await Course.find({});

        // Get user progress
        const userProgress = await Progress.find({ user: userId });

        // Map progress to courses
        const coursesWithProgress = allCourses.map(course => {
            const progress = userProgress.find(p => p.course.toString() === course._id.toString());
            return {
                _id: course._id,
                title: course.title,
                description: course.description,
                image: course.image,
                totalLessons: course.totalLessons,
                completedLessons: progress ? progress.completedLessons : 0,
                progress: progress ? Math.round((progress.completedLessons / course.totalLessons) * 100) : 0,
            };
        });

        // Calculate stats
        const coursesInProgress = coursesWithProgress.filter(c => c.progress > 0 && c.progress < 100).length;
        const completedCourses = coursesWithProgress.filter(c => c.progress === 100).length;
        // Mock learning hours for now
        const totalLearningHours = 12.5; 

        res.json({
            stats: {
                coursesInProgress,
                completedCourses,
                totalLearningHours,
                streak: req.user.streak || 0,
            },
            courses: coursesWithProgress,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get admin dashboard data
// @route   GET /api/dashboard/admin
// @access  Private (Admin)
const getAdminDashboard = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({});
        const activeStudents = await User.countDocuments({ role: 'student' }); // Simplified
        const courseCompletions = await Progress.countDocuments({ isCompleted: true });
        
        // Mock revenue
        const revenue = '$0';

        // Mock recent activity
        const recentActivity = [
            { user: 'Student 1', action: 'Completed "Intro to AI"', time: '2 mins ago' },
            { user: 'Student 5', action: 'Enrolled in "React Patterns"', time: '15 mins ago' },
            { user: 'Student 3', action: 'Submitted Assignment', time: '1 hour ago' },
            { user: 'New User', action: 'Registered', time: '2 hours ago' },
        ];

        res.json({
            stats: {
                totalUsers,
                activeStudents,
                courseCompletions,
                revenue,
            },
            recentActivity,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getStudentDashboard, getAdminDashboard };
