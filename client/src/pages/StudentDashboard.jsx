import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const StudentDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ coursesInProgress: 0, completedCourses: 0, totalLearningHours: 0 });
    const [courses, setCourses] = useState([]);
    const [quizHistory, setQuizHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                };
                const { data } = await axios.get('/api/dashboard/student', config);
                setStats(data.stats);
                setCourses(data.courses);

                const quizRes = await axios.get('/api/quiz/history', config);
                setQuizHistory(quizRes.data);

                setLoading(false);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                setLoading(false);
            }
        };

        if (user) {
            fetchDashboardData();
        }
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (loading) {
        return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-gray-900 dark:text-white">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300">
            {/* Navbar */}

            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Welcome back, {user?.firstName}!</h2>
                    <p className="text-gray-600 dark:text-gray-400">Continue where you left off.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg">
                        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-2">Courses in Progress</h3>
                        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.coursesInProgress}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg">
                        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-2">Completed Courses</h3>
                        <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.completedCourses}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg">
                        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-2">Current Streak</h3>
                        <div className="flex items-center gap-2">
                            <span className="text-3xl font-bold text-orange-500 dark:text-orange-400">{stats.streak || 0}</span>
                            <span className="text-lg text-gray-400">day</span>
                            <span className="text-2xl">🔥</span>
                        </div>
                    </div>
                </div>

                {/* AI Tools Section */}
                <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">AI Learning Tools</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    <div 
                        onClick={() => navigate('/ai-study')}
                        className="bg-gradient-to-br from-indigo-500 to-blue-600 dark:from-indigo-600 dark:to-blue-700 p-6 rounded-2xl border border-indigo-400 dark:border-indigo-500 cursor-pointer hover:scale-[1.02] transition-transform shadow-xl"
                    >
                        <h3 className="text-2xl font-bold mb-2 text-white">AI Study Buddy</h3>
                        <p className="text-indigo-100 mb-4">Upload PDFs, get summaries, and ask doubts to your personal AI mentor.</p>
                        <button className="px-4 py-2 bg-white text-indigo-600 font-bold rounded-lg shadow-md">Launch Tool</button>
                    </div>
                    <div 
                        onClick={() => navigate('/quiz')}
                        className="bg-gradient-to-br from-orange-400 to-red-500 dark:from-orange-500 dark:to-red-600 p-6 rounded-2xl border border-orange-300 dark:border-orange-400 cursor-pointer hover:scale-[1.02] transition-transform shadow-xl"
                    >
                        <h3 className="text-2xl font-bold mb-2 text-white">Quiz Generator</h3>
                        <p className="text-orange-100 mb-4">Generate instant quizzes on any topic to test your knowledge.</p>
                        <button className="px-4 py-2 bg-white text-orange-600 font-bold rounded-lg shadow-md">Start Quiz</button>
                    </div>
                </div>

                {/* Progress Report Section */}
                <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Progress Report</h3>
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-lg mb-12">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-gray-700/50">
                                <tr>
                                    <th className="px-6 py-4 text-gray-500 dark:text-gray-400 font-medium">Topic</th>
                                    <th className="px-6 py-4 text-gray-500 dark:text-gray-400 font-medium">Score</th>
                                    <th className="px-6 py-4 text-gray-500 dark:text-gray-400 font-medium">Date</th>
                                    <th className="px-6 py-4 text-gray-500 dark:text-gray-400 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {quizHistory.length > 0 ? (
                                    quizHistory.map((quiz) => (
                                        <tr key={quiz._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">{quiz.topic}</td>
                                            <td className="px-6 py-4 text-gray-900 dark:text-white">
                                                <span className="font-bold">{quiz.score}</span> / {quiz.totalQuestions}
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                                {new Date(quiz.date).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                    (quiz.score / quiz.totalQuestions) >= 0.7 
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                                                }`}>
                                                    {(quiz.score / quiz.totalQuestions) >= 0.7 ? 'Passed' : 'Needs Work'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                            No quizzes taken yet. Start a quiz to track your progress!
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* My Courses */}
                <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Available Courses</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course) => (
                        <div key={course._id} className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-gray-500 transition-all duration-300 group shadow-lg">
                            <div className={`h-32 ${course.image} relative`}>
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                            </div>
                            <div className="p-6">
                                <h4 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">{course.title}</h4>
                                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">{course.description}</p>
                                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                                    <span>{course.completedLessons}/{course.totalLessons} Lessons</span>
                                    <span>{course.progress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
                                    <div
                                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                                        style={{ width: `${course.progress}%` }}
                                    ></div>
                                </div>
                                <button className="w-full py-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium transition-colors">
                                    {course.progress > 0 ? 'Continue Learning' : 'Start Course'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default StudentDashboard;
