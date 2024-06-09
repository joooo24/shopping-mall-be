const Order = require("../models/Order");
const { randomStringGenerator } = require("../utils/randomStringGenerator");
const productController = require("./product.controller");

const orderController = {};

// 주문 생성
orderController.createOrder = async (req, res) => {
    try {
        const { userId } = req; // 사용자 ID 추출

        // 프론트엔드에서 데이터 보낸거 받아오기
        const { shipTo, contact, totalPrice, orderList } = req.body; // 주문 정보 추출

        // 재고 확인 & 재고 업데이트
        const insufficientStockItems = await productController.checkItemListStock(orderList);

        // 재고 부족 아이템이 있는지 확인
        if (insufficientStockItems.length > 0) {
            // 재고 부족 아이템이 있을 경우 에러 메시지 생성
            const errorMessage = insufficientStockItems.reduce(
                (total, item) => (total += item.message),
                "" // 에러 메시지 조합 (초기값 추가: "")
            );
            throw new Error(errorMessage); // 에러 발생
        }

        // order 만들기 (Order 모델 참고)
        const newOrder = new Order({
            userId, // 사용자 ID
            shipTo, // 배송지 정보
            contact, // 연락처 정보
            totalPrice, // 총 가격
            items: orderList, // 주문 아이템 리스트
            orderNum: randomStringGenerator(), // 주문 번호 (백엔드에서 생성함)
        });

        // 주문 저장
        await newOrder.save();

        // 성공 응답 전송
        res.status(201).json({ status: "success", data: newOrder });
    } catch (err) {
        res.status(500).json({ status: "fail", error: err, message: err.message });
    }
};

module.exports = orderController;
