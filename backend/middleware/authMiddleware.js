// IMS/backend/middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware to protect routes (checks for valid token)
const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            token = req.headers.authorization.split(" ")[1];
            // The IMS authRoutes payload is { id: user._id }
            const decoded = jwt.verify(token, process.env.JWT_SECRET); 

            // Find user by ID
            req.user = await User.findById(decoded.id).select("-password"); 
            
            if (!req.user) {
                return res.status(401).json({ message: "Not authorized, user not found." });
            }

            next();
        } catch (err) {
            console.log("Token verification failed : ", err);
            res.status(401).json({ message: "Not authorized, token failed!" });
        }
    } else {
        res.status(401).json({ message: "Not authorized, no token provided!" });
    }
};


// Middleware to check user is admin (required for user management)
const admin = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next();
    } else {
        res.status(403).json({ message: "Not authorized as an admin" })
    }
}

// Middleware for staff or admin roles (for core IMS functions)
const staffOrAdmin = (req, res, next) => {
    if (req.user && (req.user.role === "admin" || req.user.role === "staff")) {
        next();
    } else {
        res.status(403).json({ message: "Not authorized. Requires staff or admin role." })
    }
}


module.exports = { protect, admin, staffOrAdmin };