const Captain = require('../models/captainModels');
const bcrypt = require('bcrypt');  
const jwt = require('jsonwebtoken');

const { subscribeToQueue } = require('../service/rabbit')

const pendingRequests = [];

const BlacklistedToken = require('../models/blacklisted');


const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await Captain.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already in use. Please use another email." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newCaptain = await Captain.create({ name, email, password: hashedPassword });

        const token = jwt.sign({ id: newCaptain._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.status(201).json({
            message: "Captain created successfully",
            token,
            captain: { id: newCaptain._id, name, email }
        });

    } catch (error) { 
        res.status(500).json({ message: "Error creating captain", error: error.message });
    }
};


const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const captain = await Captain.findOne({ email });
        if (!captain) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, captain.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const token = jwt.sign({ id: captain._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.status(200).json({
            message: "Login successful",
            token,
            captain: { id: captain._id, name: captain.name, email: captain.email }
        });

    } catch (error) { 
        res.status(500).json({ message: "Error logging in", error: error.message });
    }
};

const getProfile = async (req, res) => {
    try {
        const captain = await Captain.findById(req.user.id).select('-password'); 
        if (!captain) {
            return res.status(404).json({ message: "Captain not found" });
        }

        res.status(200).json({ message: "Captain profile fetched successfully", captain });

    } catch (error) {
        res.status(500).json({ message: "Error fetching captain profile", error: error.message });
    }
};


const logout = async (req, res) => {
    try {
        const token = req.header('Authorization');

        if (!token) {
            return res.status(400).json({ message: "No token provided" });
        }

        const formattedToken = token.replace("Bearer ", "");
        const decoded = jwt.verify(formattedToken, process.env.JWT_SECRET);
        const captain = await Captain.findById(decoded.id);

        if (!captain) {
            return res.status(404).json({ message: "Captain not found" });
        }

        // Store the token in the BlacklistedToken collection
        await BlacklistedToken.create({ token: formattedToken });

        res.status(200).json({ message: "Captain logged out successfully", name: captain.name });

    } catch (error) {
        res.status(500).json({ message: "Error logging out", error: error.message });
    }
};

const waitForNewRide = async (req, res) => {
    console.log("📌 Client connected, waiting for a new ride...");

    // Store request in pendingRequests
    pendingRequests.push(res);

    req.setTimeout(30000, () => {
        console.log("⌛ No ride received, sending 204 No Content.");
        res.status(204).end();
    });
};

subscribeToQueue("ride_queue", (data) => {
    try {
        const rideData = JSON.parse(data);
        console.log("🚖 Received ride data:", rideData);

        if (pendingRequests.length === 0) {
            console.log("⚠️ No pending requests to send ride data to.");
            return;
        }

        // Send the new ride data to all pending requests
        pendingRequests.forEach(res => {
            res.json({ data: rideData });
        });

        console.log(`✅ Sent ride data to ${pendingRequests.length} pending requests.`);

        // Clear the pending requests
        pendingRequests.length = 0;
    } catch (error) {
        console.error("❌ Error processing ride data:", error);
    }
});




module.exports = { register, login, getProfile, logout, waitForNewRide };