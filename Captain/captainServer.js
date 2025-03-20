require('dotenv').config();
const express = require('express');
const connectDB = require('./db/captainDB');
// const { connectRabbitMQ } = require('./service/rabbit');
const captainRoutes = require('./routes/captainRoutes');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 3002;

const rabbitMq = require('./service/rabbit');
rabbitMq.connect();


// Connect to DB & RabbitMQ
connectDB();
// connectRabbitMQ();

app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/captain', captainRoutes);

app.get('/', (req, res) => {
    res.send("🚀 Captain Service is Running!");
});

// Start the server
app.listen(PORT, () => {
    console.log(`✅  Captain Service is running on port ${PORT}`);
});
