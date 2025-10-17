// src/App.jsx
import React, { useState } from 'react';
import Products from './pages/Products';
import Transactions from './pages/Transactions';
import Admin from './pages/Admin';
import Login from './pages/Login';
import { AuthProvider, useAuth } from './context/AuthContext';

// Simple Router Component
const Router = () => {
    const { user, logout, isAdmin } = useAuth();
    const [page, setPage] = useState('products');

    if (!user) {
        return <Login />;
    }

    const renderPage = () => {
        switch (page) {
            case 'products':
                return <Products />;
            case 'transactions':
                return <Transactions />;
            case 'admin':
                return <Admin />;
            default:
                return <Products />;
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            <header className="bg-white shadow-md">
                <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
                    <div className="flex items-center justify-between gap-2 text-2xl font-bold text-indigo-600">
                        <img className='h-9' src="android-chrome-512x512.png" alt="" />
                        IMS
                    </div>
                    <div className="flex items-center space-x-6">
                        <button onClick={() => setPage('products')} className={`text-gray-600 hover:text-indigo-600 ${page === 'products' ? 'border-b-2 border-indigo-600 font-semibold' : ''}`}>
                            Products
                        </button>
                        <button onClick={() => setPage('transactions')} className={`text-gray-600 hover:text-indigo-600 ${page === 'transactions' ? 'border-b-2 border-indigo-600 font-semibold' : ''}`}>
                            Transactions
                        </button>
                        {isAdmin && (
                            <button onClick={() => setPage('admin')} className={`text-gray-600 hover:text-indigo-600 ${page === 'admin' ? 'border-b-2 border-indigo-600 font-semibold' : ''}`}>
                                <strong>Admin</strong>
                            </button>
                        )}
                        <div className="text-sm font-medium text-gray-500">
                            Logged in as: <strong>{user.name}</strong> ({user.role})
                        </div>
                        <button onClick={logout} className="p-2 text-sm text-white bg-red-500 rounded-md hover:bg-red-600">
                            Logout
                        </button>
                    </div>
                </nav>
            </header>
            <main className="flex-1 container mx-auto p-4">
                {renderPage()}
            </main>
        </div>
    );
};

const App = () => (
    <AuthProvider>
        <Router />
    </AuthProvider>
);

export default App;