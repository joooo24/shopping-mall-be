const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authController = require('../controllers/auth.controller');

// /api/user

// 회원가입
router.post('/', userController.createUser);

// 토근 검증 -> 유저 정보 받아오기
router.get('/me', authController.authenticate, userController.getUser);

module.exports = router;
