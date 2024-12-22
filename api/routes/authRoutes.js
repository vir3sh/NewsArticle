const express = require('express');
const { registerUser, loginUser } = require('../controllers/authController');

const router = express.Router();

// Register endpoint (User or Admin)
router.post('/register', registerUser);

// Login endpoint
router.post('/login', loginUser);

module.exports = router;
