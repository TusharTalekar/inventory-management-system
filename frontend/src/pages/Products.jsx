// src/pages/Products.jsx
import React, { useState, useEffect } from 'react';
import { imsApi } from '../api/imsApi';
import { useAuth } from '../context/AuthContext';

const initialProductState = {
    name: '', category: '', unitPrice: 0, countInStock: 0, lowStockThreshold: 10, description: '', sku: ''
};

const Products = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [formData, setFormData] = useState(initialProductState);
    const [isEditing, setIsEditing] = useState(false);
    const [message, setMessage] = useState('');

    const fetchProducts = async () => {
        try {
            const data = await imsApi('products', 'GET', null, user?.token);
            setProducts(data);
        } catch (error) {
            setMessage(`Error fetching products: ${error.message}`);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'unitPrice' || name === 'countInStock' || name === 'lowStockThreshold' ? Number(value) : value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            let data;
            if (isEditing) {
                data = await imsApi(`products/${formData._id}`, 'PUT', formData, user.token);
                setMessage('Product updated successfully!');
            } else {
                data = await imsApi('products', 'POST', formData, user.token);
                setMessage('Product created successfully!');
            }
            fetchProducts();
            setFormData(initialProductState);
            setIsEditing(false);
        } catch (error) {
            setMessage(`Error: ${error.message}`);
        }
    };

    const handleEdit = (product) => {
        setFormData(product);
        setIsEditing(true);
    };

    const handleDelete = async (id) => {
        setMessage('');
        if (!window.confirm('Are you sure you want to delete this product?')) return;

        try {
            await imsApi(`products/${id}`, 'DELETE', null, user.token);
            setMessage('Product deleted successfully!');
            fetchProducts();
        } catch (error) {
            setMessage(`Error: ${error.message}`);
        }
    };

    const renderStockStatus = (count, threshold) => {
        if (count === 0) return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Out of Stock</span>;
        if (count <= threshold) return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Low Stock</span>;
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">In Stock</span>;
    };


    return (
        <div className="p-8 bg-white min-h-screen">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-6">Product Management</h1>
            {message && <div className={`p-3 mb-4 rounded-md ${message.startsWith('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{message}</div>}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Product Form */}
                <div className="lg:col-span-1 bg-gray-50 p-6 rounded-xl shadow-lg h-fit">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">{isEditing ? 'Edit Product' : 'Add New Product'}</h2>
                    <form onSubmit={handleSave} className="space-y-4">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Product Name</label>
                        <input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="Product Name" required className="w-full p-2 border rounded-md" />

                        <label htmlFor="sku" className="block text-sm font-medium text-gray-700">SKU</label>
                        <input id="sku" name="sku" value={formData.sku} onChange={handleChange} placeholder="SKU (Optional)" className="w-full p-2 border rounded-md" />
                        
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                        <input id="category" name="category" value={formData.category} onChange={handleChange} placeholder="Category" required className="w-full p-2 border rounded-md" />
                        
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea id="description" name="description" value={formData.description} onChange={handleChange} placeholder="Description" className="w-full p-2 border rounded-md" />
                        
                        <label htmlFor="unitPrice" className="block text-sm font-medium text-gray-700">Unit Price</label>
                        <input id="unitPrice" name="unitPrice" type="number" value={formData.unitPrice} onChange={handleChange} placeholder="Unit Price" required min="0" className="w-full p-2 border rounded-md" />
                        
                        <label htmlFor="countInStock" className="block text-sm font-medium text-gray-700">Stock Quantity</label>
                        <input id="countInStock" name="countInStock" type="number" value={formData.countInStock} onChange={handleChange} placeholder="Stock Quantity" required min="0" className="w-full p-2 border rounded-md" />
                        
                        <label htmlFor="lowStockThreshold" className="block text-sm font-medium text-gray-700">Low Stock Threshold</label>
                        <input id="lowStockThreshold" name="lowStockThreshold" type="number" value={formData.lowStockThreshold} onChange={handleChange} placeholder="Low Stock Threshold" required min="0" className="w-full p-2 border rounded-md" />
                        
                        <div className="flex space-x-2">
                            <button type="submit" className="flex-1 p-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                                {isEditing ? 'Update Product' : 'Create Product'}
                            </button>
                            {isEditing && (
                                <button type="button" onClick={() => { setIsEditing(false); setFormData(initialProductState); }} className="p-2 bg-gray-300 rounded-md hover:bg-gray-400">
                                    Cancel Edit
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Product List */}
                <div className="lg:col-span-2">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Current Inventory ({products.length})</h2>
                    <div className="overflow-x-auto shadow-lg rounded-xl">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {products.map((product) => (
                                    <tr key={product._id} className="hover:bg-indigo-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.sku}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${product.unitPrice.toFixed(2)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.countInStock}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {renderStockStatus(product.countInStock, product.lowStockThreshold)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button onClick={() => handleEdit(product)} className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                                            <button onClick={() => handleDelete(product._id)} className="text-red-600 hover:text-red-900">Delete</button>
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

export default Products;