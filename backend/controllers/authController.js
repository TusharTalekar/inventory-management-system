const User = require('../models/User');
const jwt = require('jsonwebtoken');

// ... generateToken function remains the same

// @route   POST /api/auth/register
// @desc    Register a new user
exports.registerUser = async (req, res) => {
    // CHANGE: Use email instead of username
    const { name, email, password, role } = req.body; 
    try {
        // CHANGE: Find user by email
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }
        
        // CHANGE: Pass name to create
        const user = await User.create({ name, email, password, role });

        res.status(201).json({
            _id: user._id,
            name: user.name, // NEW
            email: user.email, // CHANGE
            role: user.role,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
exports.loginUser = async (req, res) => {
    // CHANGE: Use email instead of username
    const { email, password } = req.body; 

    try {
        // CHANGE: Find user by email
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name, // NEW
                email: user.email, // CHANGE
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};