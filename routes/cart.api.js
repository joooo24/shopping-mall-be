const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const cartController = require("../controllers/cart.controller");

// /api/cart

// 토큰 검증 -> 장바구니 아이템 추가
router.post("/", authController.authenticate, cartController.addItemToCart);

// 토큰 검증 -> 장바구니 아이템 가져오기
router.get("/", authController.authenticate, cartController.getItemToCart);

// 토큰 검증 -> 장바구니 아이템 전체 삭제
router.delete("/", authController.authenticate, cartController.emptyCart);

// 토큰 검증 -> 장바구니 아이템 삭제
router.delete("/:id", authController.authenticate, cartController.deleteCartItem);

// 토큰 검증 -> 장바구니 아이템 수량 변경
router.put("/:id", authController.authenticate, cartController.editCartItem);

// 토큰 검증 -> 장바구니 수량 카운터
router.get("/qty", authController.authenticate, cartController.getCartQty);

module.exports = router;
