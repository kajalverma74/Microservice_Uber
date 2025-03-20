const express = require('express');
const { createRide, getAllRides, getRideById,acceptRide } = require('../controller/rideController');

const {authMiddleware} = require('../middleware/rideMiddleware');

const { captainAuth } = require('../middleware/rideMiddleware');



const router = express.Router();

router.post('/rides', authMiddleware, createRide);


router.get('/rides', getAllRides);


router.get('/rides/:id', getRideById);

router.put('/accept-ride', captainAuth, acceptRide);


module.exports = router;