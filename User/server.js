require('dotenv').config();
const express = require('express');
const connectDB = require('./db/db');
const userRoutes = require('./Routes/userRoutes');
const cookieParser = require('cookie-parser');

const rabbitMq = require('./service/rabbit');
rabbitMq.connect();


const app = express();
const PORT = process.env.PORT || 3001;

// Connect to DB & RabbitMQ
connectDB();

app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/users', userRoutes);

app.get('/', (req, res) => {
    res.send("🚀 User Service is Running!");
});

// Start the server
app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
});
