// src/context/AuthContext.jsx
import { useState, createContext, useContext } from 'react';
import { imsApi } from '../api/imsApi';

const AuthContext = createContext();

const initialUser = localStorage.getItem('user') 
    ? JSON.parse(localStorage.getItem('user')) 
    : null;

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(initialUser);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const saveUser = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const login = async (email, password) => {
        setLoading(true);
        setError(null);
        try {
            const data = await imsApi('auth/login', 'POST', { email, password });
            saveUser(data);
            setLoading(false);
            return data;
        } catch (err) {
            setError(err.message);
            setLoading(false);
            throw err;
        }
    };

    const register = async (name, email, password, role = 'staff') => {
        setLoading(true);
        setError(null);
        try {
            // Note: Registration on the public route will default to staff/admin role if passed
            const data = await imsApi('auth/register', 'POST', { name, email, password, role });
            // For general registration, we don't auto-login or store the user info immediately 
            // to force them to the login page, but the backend returns a token, so we can.
            saveUser(data); 
            setLoading(false);
            return data;
        } catch (err) {
            setError(err.message);
            setLoading(false);
            throw err;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, loading, error, login, register, logout, isAdmin: user?.role === 'admin' }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);