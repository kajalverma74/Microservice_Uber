const express = require('express');
const router = express.Router();
const {register, login, getProfile, logout, waitForNewRide} = require('../controller/captainController'); 

const captainMiddleware = require('../middleware/captainMiddleware');

router.post('/register', register);

router.post('/login', login);

router.get('/profile', captainMiddleware, getProfile); 

router.post('/logout', captainMiddleware, logout);

router.get('/new-ride', captainMiddleware,waitForNewRide);



module.exports = router;