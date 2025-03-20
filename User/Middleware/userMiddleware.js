const jwt = require('jsonwebtoken');
const BlacklistedToken = require('../Models/BlacklistedToken');
const User = require('../Models/userModels');

const authMiddleware = async (req, res, next) => {
    try {
        let token = req.header('Authorization');

        if (!token || typeof token !== "string" || !token.startsWith("Bearer ")) {
            console.log("❌ Invalid Authorization header format");
            return res.status(401).json({ message: "Invalid token format" });
        }

        // Extract actual token
        token = token.slice(7).trim();
        console.log("✅ Extracted Token:", token);

        // Check if token is blacklisted
        const isBlacklisted = await BlacklistedToken.findOne({ token });
        if (isBlacklisted) {
            console.log("❌ Token is blacklisted");
            return res.status(403).json({ message: "Token is blacklisted. Please log in again." });
        }

        // Verify JWT Token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            console.log(`❌ ${error.name}: ${error.message}`);
            return res.status(error.name === "TokenExpiredError" ? 401 : 403).json({
                message: error.name === "TokenExpiredError" ? "Session expired. Please log in again." : "Invalid token",
            });
        }

        console.log("✅ Decoded Token:", decoded);

        // Fetch user from database
        const user = await User.findById(decoded.id).select("-password");
        if (!user) {
            console.log("❌ User associated with token not found");
            return res.status(401).json({ message: "User not found" });
        }

        req.user = user; // Attach user object to request
        console.log("✅ User Attached to Request:", req.user);
        next();
    } catch (error) {
        console.log("❌ Error in authMiddleware:", error.message);
        res.status(500).json({ message: "Authentication error", error: error.message });
    }
};

module.exports = authMiddleware;
