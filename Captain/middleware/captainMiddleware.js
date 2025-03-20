const jwt = require('jsonwebtoken');
const BlacklistedToken = require('../models/blacklisted');

const captainMiddleware = async (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ message: "Access Denied! No token provided" });
    }

    const formattedToken = token.replace("Bearer ", "");

    const isBlacklisted = await BlacklistedToken.findOne({ token: formattedToken });
    if (isBlacklisted) {
        return res.status(403).json({ message: "Token is blacklisted. Please log in again." });
    }

    try {
        const decoded = jwt.verify(formattedToken, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(403).json({ message: "Invalid or expired token" });
    }
};

module.exports = captainMiddleware;
