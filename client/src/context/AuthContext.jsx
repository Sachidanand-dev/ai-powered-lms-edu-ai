import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            const userInfo = localStorage.getItem('userInfo');
            if (userInfo) {
                setUser(JSON.parse(userInfo));
            }
            // Artificial delay for loader visibility
            await new Promise(resolve => setTimeout(resolve, 2000));
            setLoading(false);
        };
        checkUser();
    }, []);

    const login = async (email, password) => {
        try {
            const { data } = await axios.post('http://localhost:5000/api/auth/login', {
                email,
                password,
            });
            localStorage.setItem('userInfo', JSON.stringify(data));
            setUser(data);
            return { success: true, role: data.role };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || error.message,
            };
        }
    };

    const register = async (firstName, lastName, email, password, phoneNumber) => {
        try {
            const { data } = await axios.post('http://localhost:5000/api/auth/register', {
                firstName,
                lastName,
                email,
                password,
                phoneNumber,
            });
            // Don't set user yet, wait for OTP verification
            return { success: true, message: data.message };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || error.message,
            };
        }
    };

    const verifyOtp = async (email, otp) => {
        try {
            const { data } = await axios.post('http://localhost:5000/api/auth/verify-otp', {
                email,
                otp,
            });
            localStorage.setItem('userInfo', JSON.stringify(data));
            setUser(data);
            return { success: true, role: data.role };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || error.message,
            };
        }
    };

    const updateProfile = async (profileData) => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.put('http://localhost:5000/api/auth/profile', profileData, config);
            localStorage.setItem('userInfo', JSON.stringify(data));
            setUser(data);
            return { success: true, message: 'Profile updated successfully' };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || error.message,
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('userInfo');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, verifyOtp, updateProfile, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
