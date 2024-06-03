const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const productController = require('../controllers/product.controller');

// /api/product

// 토큰 검증 -> 어드민 체크 -> 상품 생성
router.post('/',
    authController.authenticate,
    authController.checkAdminPermission,
    productController.createProduct
);

module.exports = router;
