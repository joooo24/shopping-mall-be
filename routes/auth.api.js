const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// 이메일로그인 /api/auth/login
router.post('/login', authController.loginWithEmail);

module.exports = router;
