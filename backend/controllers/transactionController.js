const Transaction = require('../models/Transaction');
const Product = require('../models/Product');

// @route   POST /api/transactions
// @desc    Record a new transaction (sale or restock)
exports.recordTransaction = async (req, res) => {
    const { productId, transactionType, quantityChange } = req.body;

    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        let newQuantity;
        if (transactionType === 'sale') {
            // FIX: Use product.countInStock instead of product.quantity
            newQuantity = product.countInStock - quantityChange;
        } else if (transactionType === 'restock') {
            // FIX: Use product.countInStock instead of product.quantity
            newQuantity = product.countInStock + quantityChange;
        } else {
            return res.status(400).json({ message: 'Invalid transaction type.' });
        }

        if (newQuantity < 0) {
            return res.status(400).json({ message: 'Insufficient stock for this sale.' });
        }

        // 1. Create the Transaction Log
        const newTransaction = new Transaction({
            product: productId,
            transactionType,
            quantityChange,
            unitPriceAtTransaction: product.unitPrice,
            // user: req.user._id // Uncomment if implementing JWT middleware
        });
        await newTransaction.save();

        // 2. Update the Product Stock
        // FIX: Update product.countInStock instead of product.quantity
        product.countInStock = newQuantity;
        await product.save();

        res.status(201).json({ message: 'Transaction recorded and stock updated successfully.', product, newTransaction });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @route   GET /api/transactions
// @desc    Get all transactions
exports.getTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find()
            .populate('product', 'name unitPrice')
            .sort({ transactionDate: -1 });
        res.status(200).json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching transactions' });
    }
};