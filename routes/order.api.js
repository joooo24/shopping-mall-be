const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const orderController = require("../controllers/order.controller");

// /api/order

// 토큰 검증 -> 주문 생성
router.post("/", authController.authenticate, orderController.createOrder);

// 토큰 검증 -> 나의 주문 가져오기
router.get("/me", authController.authenticate, orderController.getOrder);

// 토큰 검증 -> 모든 주문 목록 가져오기 (관리자)
router.get("/", authController.authenticate, orderController.getOrderList);

// 토큰 검증 -> 관리자 확인 -> 주문 상태 변경
router.put(
    "/:id",
    authController.authenticate,
    authController.checkAdminPermission,
    orderController.updateOrder
);

module.exports = router;
