const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const orderController = require("../controllers/order.controller");

// /api/order

// 토큰 검증 -> 주문 생성
router.post("/", authController.authenticate, orderController.createOrder);

module.exports = router;
