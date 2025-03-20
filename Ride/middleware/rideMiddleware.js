const jwt = require('jsonwebtoken');
const axios = require('axios');

const authMiddleware = async (req, res, next) => {
    try {
        // console.log("Headers:", req.headers);
        // console.log("Cookies:", req.cookies);

        // Check if token exists
        const token = req.cookies?.token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);

        if (!token) {
            console.log("Unauthorized: No token found");
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Verify JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded Token:", decoded);

        // Fetch user profile from API
        const response = await axios.get(`${process.env.USER_SERVICE_URL}/users/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log("Response from user profile API:", response.data);

        if (!response.data) {
            console.log("Unauthorized: No user found");
            return res.status(401).json({ message: 'Unauthorized' });
        }

        req.user = response.data;
        next();
    } catch (error) {
        console.log("Error in userAuth middleware:", error.message);
        return res.status(500).json({ message: "Authentication error", error: error.message });
    }
};



const captainAuth = async (req, res, next) => {
    try {
        const token = req.cookies.token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);
        console.log("Token:", token);

        if (!token) {
            console.log("Unauthorized: No token found");
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded Token:", decoded);

        const response = await axios.get(`${process.env.CAPTAIN_SERVICE_URL}/captain/profile`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        console.log("Response from captain profile API:", response.data);

        const captain = response.data;

        if (!captain) {
            console.log("Unauthorized: No captain found");
            return res.status(401).json({ message: 'Unauthorized' });
        }

        req.captain = captain;
        next();

    } catch (error) {
        console.log("Error in captainAuth middleware:", error.message);
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
    authMiddleware,
    captainAuth
};
