const express = require('express');
const router = express.Router();
const {register, login, getProfile, logout} = require('../Controller/userController'); 

const authMiddleware = require('../Middleware/userMiddleware');


router.post('/register', register);

router.post('/login', login);

router.get('/profile', authMiddleware, getProfile); 

router.post('/logout', authMiddleware, logout);



module.exports = router;