import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import api from '../services/api';

const useAuth = () => {
    const { setAuthData } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const registerUser = async (userData) => {
        try {
            const response = await api.registerUser(userData);
            setAuthData(response.data);
        } catch (err) {
            setError(err.response.data.message);
        }
    };

    const loginUser = async (credentials) => {
        try {
            const response = await api.loginUser(credentials);
            setAuthData(response.data);
        } catch (err) {
            setError(err.response.data.message);
        }
    };

    const logoutUser = () => {
        setAuthData(null);
    };

    useEffect(() => {
        // Logic to check if user is already authenticated
        const token = localStorage.getItem('token');
        if (token) {
            setAuthData({ token });
        }
        setLoading(false);
    }, [setAuthData]);

    return {
        loading,
        error,
        registerUser,
        loginUser,
        logoutUser,
    };
};

export default useAuth;