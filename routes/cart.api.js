const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const cartController = require('../controllers/cart.controller');

// /api/cart

// 토큰 검증 -> 장바구니 아이템 추가
router.post('/',
    authController.authenticate,
    cartController.addItemToCart
);

module.exports = router;
