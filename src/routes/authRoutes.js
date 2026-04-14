const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { registerAdmin, login } = require('../controllers/authController');

const router = express.Router();

router.post('/register-admin', asyncHandler(registerAdmin));
router.post('/login', asyncHandler(login));

module.exports = router;
