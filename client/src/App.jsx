import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import LandingPage from './pages/LandingPage';
import AIStudy from './pages/AIStudy';
import QuizGenerator from './pages/QuizGenerator';
import Settings from './pages/Settings';
import Navbar from './components/Navbar';
import GuestGuard from './components/GuestGuard';
import { ThemeProvider } from './context/ThemeContext';

import Loader from './components/Loader';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <Loader />;
    }

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" />; // Or unauthorized page
    }

    return children;
};

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <Router>
                    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
                        <Navbar />
                        <Routes>
                            <Route path="/" element={<LandingPage />} />
                            <Route
                                path="/login"
                                element={
                                    <GuestGuard>
                                        <Login />
                                    </GuestGuard>
                                }
                            />
                            <Route
                                path="/register"
                                element={
                                    <GuestGuard>
                                        <Register />
                                    </GuestGuard>
                                }
                            />
                            <Route
                                path="/admin"
                                element={
                                    <ProtectedRoute allowedRoles={['admin']}>
                                        <AdminDashboard />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/student"
                                element={
                                    <ProtectedRoute allowedRoles={['student']}>
                                        <StudentDashboard />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/ai-study"
                                element={
                                    <ProtectedRoute allowedRoles={['student']}>
                                        <AIStudy />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/quiz"
                                element={
                                    <ProtectedRoute allowedRoles={['student']}>
                                        <QuizGenerator />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/settings"
                                element={
                                    <ProtectedRoute allowedRoles={['student', 'admin']}>
                                        <Settings />
                                    </ProtectedRoute>
                                }
                            />
                        </Routes>
                    </div>
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
