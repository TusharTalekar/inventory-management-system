const Product = require('../models/Product');

// @route   GET /api/products
// @desc    Get all products
exports.getProducts = async (req, res) => {
    try {
        const products = await Product.find().sort({ name: 1 });
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching products' });
    }
};

// @route   POST /api/products
// @desc    Create a new product
exports.createProduct = async (req, res) => {
    // CHANGE: Use countInStock, and accept new fields (description, sku, images)
    const { name, category, unitPrice, countInStock, lowStockThreshold, description, sku, images } = req.body;

    try {
        const newProduct = new Product({
            name, category, unitPrice, 
            countInStock, // CHANGE
            lowStockThreshold,
            description, // NEW
            sku, // NEW
            images, // NEW
            // Assuming req.user is set by JWT middleware (must be added)
            // user: req.user._id, // UNCOMMENT THIS LINE IF YOU ADD AUTH MIDDLEWARE
        });
        const product = await newProduct.save();
        res.status(201).json(product);
    } catch (error) {
        // ... (rest remains the same)
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Product name or SKU already exists.' });
        }
        res.status(400).json({ message: error.message });
    }
};

// @route   PUT /api/products/:id
// @desc    Update product details
exports.updateProduct = async (req, res) => {
    try {
        // CHANGE: Update uses the new fields (e.g., countInStock)
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @route   DELETE /api/products/:id
// @desc    Delete a product
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json({ message: 'Product successfully deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};







