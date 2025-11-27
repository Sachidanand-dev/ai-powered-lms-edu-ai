import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from './Loader';

const GuestGuard = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <Loader />;
    }

    if (user) {
        if (user.role === 'admin') {
            return <Navigate to="/admin" />;
        }
        return <Navigate to="/student" />;
    }

    return children;
};

export default GuestGuard;
