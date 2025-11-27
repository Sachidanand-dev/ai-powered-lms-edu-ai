import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                };
                const { data } = await axios.get('http://localhost:5000/api/dashboard/admin', config);
                
                // Transform stats for UI
                const transformedStats = [
                    { title: 'Total Users', value: data.stats.totalUsers, change: '+12%', color: 'from-blue-500 to-cyan-500' },
                    { title: 'Active Students', value: data.stats.activeStudents, change: '+5%', color: 'from-purple-500 to-pink-500' },
                    { title: 'Course Completions', value: data.stats.courseCompletions, change: '0%', color: 'from-orange-500 to-red-500' },
                    { title: 'Revenue', value: data.stats.revenue, change: '0%', color: 'from-green-500 to-emerald-500' },
                ];

                setStats(transformedStats);
                setRecentActivity(data.recentActivity);
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
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {stats.map((stat, index) => (
                        <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 relative overflow-hidden shadow-lg">
                            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-10 rounded-bl-full`}></div>
                            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-2">{stat.title}</h3>
                            <div className="flex items-baseline space-x-2">
                                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                                <span className="text-green-500 dark:text-green-400 text-sm font-medium">{stat.change}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content Area (Placeholder for Charts/Tables) */}
                    <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-lg">
                        <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Platform Overview</h3>
                        <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-dashed border-gray-300 dark:border-gray-600">
                            <p className="text-gray-500 dark:text-gray-400">Analytics Chart Placeholder</p>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-lg">
                        <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Recent Activity</h3>
                        <div className="space-y-6">
                            {recentActivity.map((item, index) => (
                                <div key={index} className="flex items-start space-x-4">
                                    <div className="w-2 h-2 mt-2 rounded-full bg-blue-500"></div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{item.action}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{item.user} • {item.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
