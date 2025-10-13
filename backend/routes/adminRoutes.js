// IMS/backend/routes/adminRoutes.js
const express = require("express");
const User = require("../models/User");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

// @ GET /api/admin/users - Get all users
// @access private/admin
router.get("/", protect, admin, async (req, res) => {
    try {
        const users = await User.find({}).select("-password");
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error." });
    }
});


// @ POST /api/admin/users - Add new user
// @access private/admin
router.post("/", protect, admin, async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "User already exists." });
        }

        // Only allow role 'admin' or 'staff' in IMS
        const userRole = (role === 'admin' || role === 'staff') ? role : "staff";

        user = await User.create({ name, email, password, role: userRole });

        res.status(201).json({ 
            message: "User created successfully", 
            user: { _id: user._id, name: user.name, email: user.email, role: user.role }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error." });
    }
});


// @ PUT /api/admin/users/:id - Update user info/role
// @access private/admin
router.put("/:id", protect, admin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (req.body.name) user.name = req.body.name;
        if (req.body.email) user.email = req.body.email;
        if (req.body.role && (req.body.role === 'admin' || req.body.role === 'staff')) {
            user.role = req.body.role;
        }

        const updatedUser = await user.save();
        res.json({ 
            message: "User updates successfully", 
            user: { _id: updatedUser._id, name: updatedUser.name, email: updatedUser.email, role: updatedUser.role }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error." });
    }
});


// @ DELETE /api/admin/users/:id - Delete user
// @access private/admin
router.delete("/:id", protect, admin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            await user.deleteOne();
            res.json({ message: "User deleted successfully" });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});


module.exports = router;