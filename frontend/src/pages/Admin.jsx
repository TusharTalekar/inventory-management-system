// src/pages/Admin.jsx
import React, { useState, useEffect } from 'react';
import { imsApi } from '../api/imsApi';
import { useAuth } from '../context/AuthContext';

const initialUserState = {
    name: '', email: '', password: '', role: 'staff'
};

const Admin = () => {
    const { user, isAdmin } = useAuth();
    const [users, setUsers] = useState([]);
    const [formData, setFormData] = useState(initialUserState);
    const [isEditing, setIsEditing] = useState(false);
    const [message, setMessage] = useState('');

    const fetchUsers = async () => {
        if (!isAdmin) {
            setMessage('Access Denied: You must be an admin to view this page.');
            return;
        }
        try {
            const data = await imsApi('admin/users', 'GET', null, user.token);
            setUsers(data);
        } catch (error) {
            setMessage(`Error fetching users: ${error.message}`);
        }
    };

    useEffect(() => {
        if (user) fetchUsers();
    }, [user, isAdmin]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setMessage('');
        if (!isAdmin) {
            setMessage('Access Denied. Admin privileges required.');
            return;
        }
        
        try {
            let data;
            if (isEditing) {
                // Remove password if not explicitly changed for PUT
                const updateBody = { ...formData };
                if (!updateBody.password) delete updateBody.password;
                // Backend PUT route handles role validation ('admin' or 'staff')
                data = await imsApi(`admin/users/${formData._id}`, 'PUT', updateBody, user.token); 
                setMessage('User updated successfully!');
            } else {
                // Backend POST route handles role validation ('admin' or 'staff' only)
                data = await imsApi('admin/users', 'POST', formData, user.token);
                setMessage('User created successfully!');
            }
            fetchUsers();
            setFormData(initialUserState);
            setIsEditing(false);
        } catch (error) {
            setMessage(`Error: ${error.message}`);
        }
    };

    const handleEdit = (userData) => {
        // Clear password field when editing to prevent accidental updates
        setFormData({ ...userData, password: '' }); 
        setIsEditing(true);
    };

    const handleDelete = async (id) => {
        setMessage('');
        if (!isAdmin || !window.confirm('Are you sure you want to delete this user?')) return;

        try {
            await imsApi(`admin/users/${id}`, 'DELETE', null, user.token);
            setMessage('User deleted successfully!');
            fetchUsers();
        } catch (error) {
            setMessage(`Error: ${error.message}`);
        }
    };

    if (!user) {
        return <div className="p-8 text-center text-red-500">Please log in to access this feature.</div>;
    }

    if (!isAdmin) {
        return <div className="p-8 text-center text-red-500">Unauthorized. This page is only for administrators.</div>;
    }

    return (
        <div className="p-8 bg-white min-h-screen">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-6">User Management (Admin)</h1>
            {message && <div className={`p-3 mb-4 rounded-md ${message.startsWith('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{message}</div>}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* User Form */}
                <div className="lg:col-span-1 bg-gray-50 p-6 rounded-xl shadow-lg h-fit">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">{isEditing ? 'Edit User' : 'Add New User'}</h2>
                    <form onSubmit={handleSave} className="space-y-4">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" required className="w-full p-2 border rounded-md" />

                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                        <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email Address" required className="w-full p-2 border rounded-md" />

                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                        <input id="password" name="password" type="password" value={formData.password} onChange={handleChange} placeholder={isEditing ? 'Leave blank to keep current password' : 'Password'} required={!isEditing} className="w-full p-2 border rounded-md" />
                        
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
                        <select id="role" name="role" value={formData.role} onChange={handleChange} required className="w-full p-2 border rounded-md">
                            <option value="staff">Staff</option>
                            <option value="admin">Admin</option>
                        </select>
                        
                        <div className="flex space-x-2">
                            <button type="submit" className="flex-1 p-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                                {isEditing ? 'Update User' : 'Create User'}
                            </button>
                            {isEditing && (
                                <button type="button" onClick={() => { setIsEditing(false); setFormData(initialUserState); }} className="p-2 bg-gray-300 rounded-md hover:bg-gray-400">
                                    Cancel Edit
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* User List */}
                <div className="lg:col-span-2">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">System Users ({users.length})</h2>
                    <div className="overflow-x-auto shadow-lg rounded-xl">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {users.map((u) => (
                                    <tr key={u._id} className="hover:bg-indigo-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{u.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.role === 'admin' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-200 text-gray-800'}`}>
                                                {u.role.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button onClick={() => handleEdit(u)} className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                                            <button onClick={() => handleDelete(u._id)} className="text-red-600 hover:text-red-900">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Admin;