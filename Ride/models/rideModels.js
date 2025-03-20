const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
    riderName: {
        type: String,
        required: true,
    },
    driverName: {
        type: String,
        required: true,
    },
    pickupLocation: {
        type: String,
        required: true,
    },
    dropoffLocation: {
        type: String,
        required: true,
    },
    fare: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed', 'cancelled', 'accepted'], // Add 'accepted'
        default: 'pending',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

const Ride = mongoose.model('Ride', rideSchema);

module.exports = Ride;  