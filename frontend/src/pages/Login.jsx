// src/pages/Login.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState('');
    const [role, setRole] = useState('staff');

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, register, error, loading } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isLogin) {
            await login(email, password);
        } else {
            // New users registered here default to 'staff' as per backend logic, 
            // unless admin manually creates them later.
            await register(name, email, password, role);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-2xl">
                <h2 className="text-3xl font-extrabold text-center text-indigo-700">
                    {isLogin ? 'Sign in to IMS' : 'Create an Account'}
                </h2>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    {!isLogin && (
                        <>
                            <input
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                type="text"
                                placeholder="Full Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required={!isLogin}
                            />

                            <select
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                required={!isLogin}
                            >
                                <option value="staff">Staff</option>
                                <option value="admin">Admin</option>
                            </select>

                        </>
                    )}
                    <input
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    {error && <p className="text-red-600 text-sm">{error}</p>}
                    <button
                        type="submit"
                        className="w-full p-3 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Register')}
                    </button>
                </form>

                <div className="text-center">
                    <button
                        className="text-sm text-indigo-600 hover:text-indigo-800"
                        onClick={() => { setIsLogin(!isLogin); setError(null); }}
                    >
                        {isLogin ? 'Need an account? Register' : 'Already have an account? Login'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;