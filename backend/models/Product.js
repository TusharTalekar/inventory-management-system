const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        unique: true,
        trim: true,
    },
    description: { // NEW field from EC-Quantum style
        type: String,
        default: 'No description provided.',
    },
    sku: { // NEW field
        type: String,
        unique: true,
        default: () => Math.random().toString(36).substring(2, 10).toUpperCase(),
    },
    images: [{ // NEW field
        url: { type: String },
        altText: { type: String }
    }],
    category: {
        type: String,
        default: 'General',
    },
    unitPrice: {
        type: Number,
        required: [true, 'Unit price is required'],
        min: 0,
    },
    countInStock: { // Changed from 'quantity'
        type: Number,
        required: true,
        default: 0,
        min: 0,
    },
    lowStockThreshold: {
        type: Number,
        default: 10,
        min: 0,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);