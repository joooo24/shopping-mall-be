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

// 상품 조회
router.get('/',
    productController.getProducts
);

// 상품 상세 조회
router.get('/:id',
    productController.getProductDetail
);

// 상품 수정
router.put('/:id',
    authController.authenticate,
    authController.checkAdminPermission,
    productController.updateProduct
);

// 상품 삭제 (isDelete값 변경)
router.delete('/:id',
    authController.authenticate,
    authController.checkAdminPermission,
    productController.updateProduct
);

module.exports = router;
