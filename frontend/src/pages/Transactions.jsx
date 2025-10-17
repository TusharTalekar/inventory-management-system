import React, { useState, useEffect } from 'react';
import { imsApi } from '../api/imsApi';
import { useAuth } from '../context/AuthContext';

const initialTransactionState = {
    productId: '', transactionType: 'sale', quantityChange: 1
};

const Transactions = () => {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [products, setProducts] = useState([]); // Needed for the dropdown
    const [formData, setFormData] = useState(initialTransactionState);
    const [message, setMessage] = useState('');

    const fetchTransactions = async () => {
        try {
            // Backend populates product name and unit price
            const data = await imsApi('transactions', 'GET', null, user?.token);
            setTransactions(data);
        } catch (error) {
            setMessage(`Error fetching transactions: ${error.message}`);
        }
    };

    const fetchProductsForDropdown = async () => {
        try {
            const data = await imsApi('products', 'GET', null, user?.token);
            setProducts(data);
            if (data.length > 0) {
                // Only set productId if it's the initial load or if the current one is invalid ('')
                setFormData(prev => ({ 
                    ...prev, 
                    productId: prev.productId || data[0]._id 
                }));
            }
        } catch (error) {
            setMessage(`Error fetching products for form: ${error.message}`);
        }
    }

    useEffect(() => {
        fetchTransactions();
        fetchProductsForDropdown();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'quantityChange' ? Number(value) : value }));
    };

    const handleRecord = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            await imsApi('transactions', 'POST', formData, user.token);
            setMessage('Transaction recorded and stock updated successfully!');
            
            // 1. Refresh transactions list
            fetchTransactions();
            
            // 2. Refetch products to get updated stock levels in the dropdown
            const freshProducts = await imsApi('products', 'GET', null, user?.token);
            setProducts(freshProducts);

            // 3. Reset form data, using a valid product ID for the next transaction
            const resetProductId = freshProducts.length > 0 ? freshProducts[0]._id : '';

            // This resets the form to default values, but with a valid productId
            setFormData({ 
                productId: resetProductId, 
                transactionType: initialTransactionState.transactionType,
                quantityChange: initialTransactionState.quantityChange 
            });
            
        } catch (error) {
            setMessage(`Error: ${error.message}`);
        }
    };

    const formatTransactionDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    }

    return (
        <div className="p-8 bg-white min-h-screen">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-6">Inventory Transactions</h1>
            {message && <div className={`p-3 mb-4 rounded-md ${message.startsWith('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{message}</div>}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Transaction Form */}
                <div className="lg:col-span-1 bg-gray-50 p-6 rounded-xl shadow-lg h-fit">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Record New Transaction</h2>
                    <form onSubmit={handleRecord} className="space-y-4">
                        <label htmlFor="productId" className="block text-sm font-medium text-gray-700">Product</label>
                        <select id="productId" name="productId" value={formData.productId} onChange={handleChange} required className="w-full p-2 border rounded-md">
                            {products.map(p => (
                                <option key={p._id} value={p._id}>{p.name} (Stock: {p.countInStock})</option>
                            ))}
                        </select>
                        
                        <label htmlFor="transactionType" className="block text-sm font-medium text-gray-700">Transaction Type</label>
                        <select id="transactionType" name="transactionType" value={formData.transactionType} onChange={handleChange} required className="w-full p-2 border rounded-md">
                            <option value="sale">Sale (Deduct Stock)</option>
                            <option value="restock">Restock (Add Stock)</option>
                        </select>

                        <label htmlFor="quantityChange" className="block text-sm font-medium text-gray-700">Quantity</label>
                        <input id="quantityChange" name="quantityChange" type="number" value={formData.quantityChange} onChange={handleChange} placeholder="Quantity" required min="1" className="w-full p-2 border rounded-md" />

                        <button type="submit" className="w-full p-2 text-white bg-green-600 rounded-md hover:bg-green-700">
                            Record {formData.transactionType.charAt(0).toUpperCase() + formData.transactionType.slice(1)}
                        </button>
                    </form>
                </div>

                {/* Transaction History List */}
                <div className="lg:col-span-2">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Transaction History ({transactions.length})</h2>
                    <div className="overflow-x-auto shadow-lg rounded-xl">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price/Unit</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {transactions.map((t) => (
                                    // ADD CONDITIONAL CHECK HERE
                                    <tr key={t._id} className="hover:bg-indigo-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatTransactionDate(t.transactionDate)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {/* CHECK IF PRODUCT EXISTS BEFORE READING NAME */}
                                            {t.product ? t.product.name : 'Product Deleted'}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${t.transactionType === 'sale' ? 'text-red-600' : 'text-green-600'}`}>{t.transactionType.toUpperCase()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t.quantityChange}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {/* CHECK IF PRODUCT EXISTS BEFORE READING unitPriceAtTransaction */}
                                            {t.product ? `$${t.unitPriceAtTransaction.toFixed(2)}` : 'N/A'}
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

export default Transactions;