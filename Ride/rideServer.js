const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./db/rideDb');
const rideRoutes = require('./routes/rideRoutes');
const cookieParser = require('cookie-parser');

const rabbitMq = require('./service/rabbitMQ');
rabbitMq.connect();


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

// ✅ Middleware should be placed BEFORE routes
app.use(express.json());  // Parses JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded form data
app.use(cookieParser());  // Parses cookies
app.use(express.static('public')); // Serves static files

// ✅ Connect to Database
connectDB();

// ✅ Use ride routes
app.use('/api', rideRoutes);

// ✅ Test Route
app.get('/', (req, res) => {
    res.send('Ride Service API is running...');
});

// ✅ Start the server
app.listen(PORT, () => {
    console.log(`🚀 Ride Service Server running on port ${PORT}`);
});
