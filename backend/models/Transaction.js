const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    transactionType: {
        type: String, // 'sale' or 'restock'
        required: true,
        enum: ['sale', 'restock'],
    },
    quantityChange: { // The quantity involved in this transaction
        type: Number,
        required: true,
        min: 1,
    },
    unitPriceAtTransaction: { // The price/cost at the time of transaction
        type: Number,
        required: true,
    },
    transactionDate: {
        type: Date,
        default: Date.now,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', TransactionSchema);
