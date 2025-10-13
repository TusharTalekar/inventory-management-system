const User = require('../models/User');
const jwt = require('jsonwebtoken');
const express = require('express');
const { registerUser, loginUser } = require('../controllers/authController');

const router = express.Router();

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

router.post('/register', async (req, res) => {
    const { name, email, password, role } = req.body; // Changed to use name and email
    try {
        const userExists = await User.findOne({ email }); // Find by email
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({ name, email, password, role });
        // NOTE: Removed redundant User.save()

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error(error);
        
        res.status(500).json({ message: 'Server error' });
    }
});


router.post('/login', async (req, res) => {
    const { email, password } = req.body; // Changed to use email

    try {
        const user = await User.findOne({ email }); // Find by email

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;