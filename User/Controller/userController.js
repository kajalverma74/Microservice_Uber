const User = require('../Models/userModels');
const bcrypt = require('bcrypt');  
const jwt = require('jsonwebtoken');

const BlacklistedToken = require('../Models/BlacklistedToken');


const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already in use. Please use another email." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({ name, email, password: hashedPassword });

        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.status(201).json({
            message: "User created successfully",
            token,
            user: { id: newUser._id, name, email }
        });

    } catch (error) { 
        res.status(500).json({ message: "Error creating user", error: error.message });
    }
};


const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.status(200).json({
            message: "Login successful",
            token,
            user: { id: user._id, name: user.name, email: user.email }
        });

    } catch (error) { 
        res.status(500).json({ message: "Error logging in", error: error.message });
    }
};

const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password'); // Exclude password
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "User profile fetched successfully", user });

    } catch (error) {
        res.status(500).json({ message: "Error fetching user profile", error: error.message });
    }
};


const logout = async (req, res) => {
    try {
        const token = req.header('Authorization');

        if (!token) {
            return res.status(400).json({ message: "No token provided" });
        }

        const formattedToken = token.replace("Bearer ", "");

        // Verify token to extract user ID
        const decoded = jwt.verify(formattedToken, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Store the token in the BlacklistedToken collection
        await BlacklistedToken.create({ token: formattedToken });

        res.status(200).json({ message: "User logged out successfully", name: user.name });

    } catch (error) {
        res.status(500).json({ message: "Error logging out", error: error.message });
    }
};

module.exports = { register, login, getProfile, logout };