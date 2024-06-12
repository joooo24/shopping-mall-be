const Order = require("../models/Order");
const { randomStringGenerator } = require("../utils/randomStringGenerator");
const productController = require("./product.controller");

const PAGE_SIZE = 5;
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
        res.status(200).json({ status: "success", data: newOrder });
    } catch (err) {
        res.status(500).json({ status: "fail", error: err, message: err.message });
    }
};

// 주문 가져오기
orderController.getOrder = async (req, res, next) => {
    try {
        // 요청에서 userId를 가져옴
        const { userId } = req;

        // userId로 사용자의 주문 목록을 찾고, items와 해당 items의 productId를 populate 함
        // productId 필드에서 image와 name 속성만 선택하여 반환함
        const orderList = await Order.find({ userId: userId }).populate({
            path: "items",
            populate: {
                path: "productId",
                model: "Product",
                select: "image name",
            },
        });

        // 사용자의 전체 주문 수를 계산함
        const totalItemNum = await Order.find({ userId: userId }).count();

        // 전체 페이지 수를 계산함 (페이지 크기는 PAGE_SIZE로 정의됨)
        const totalPageNum = Math.ceil(totalItemNum / PAGE_SIZE);

        // 성공적으로 주문 목록과 총 페이지 수를 응답으로 반환
        res.status(200).json({ status: "success", data: orderList, totalPageNum });
    } catch (error) {
        // 에러가 발생한 경우 상태 코드 400과 함께 에러 메시지를 반환
        return res.status(400).json({ status: "fail", error: error.message });
    }
};

// 주문 목록 가져오기
orderController.getOrderList = async (req, res, next) => {
    try {
        // query에서 가져온 파라미터(page, ordernum)
        const { page, ordernum } = req.query;

        // 조건 객체를 초기화
        let condition = {};

        // orderNum이 쿼리에 있다면 -> 조건 객체에 정규 표현식 조건 추가
        // orderNum을 포함하기만 하면 되고, 대소문자 구분하지 않겠다.
        if (ordernum) {
            condition = {
                orderNum: { $regex: ordernum, $options: "i" },
            };
        }

        // 전체 데이터 개수
        const totalItemNum = await Order.find(condition).count();

        // 전체 페이지 수를 계산
        const totalPageNum = Math.ceil(totalItemNum / PAGE_SIZE);

        // condition에 맞는 orderList 찾고 페이지네이션 적용
        const orderList = await Order.find(condition)
            .populate("userId") // userId를 populate 함
            .populate({
                path: "items",
                populate: {
                    path: "productId",
                    model: "Product",
                    select: "image name",
                },
            })
            .skip((page - 1) * PAGE_SIZE) // 페이지네이션 적용
            .limit(PAGE_SIZE); // 페이지당 항목 수 제한

        // 응답 개체 생성
        const response = {
            status: "success",
            data: orderList,
            totalItemNum: totalItemNum,
            totalPageNum: totalPageNum,
        };

        res.status(200).json(response);
    } catch (error) {
        return res.status(400).json({ status: "fail", error: error.message });
    }
};

// 주문 상태 업데이트
orderController.updateOrder = async (req, res, next) => {
    try {
        // 주문 ID
        const { id: orderId } = req.params;
        // 주문 상태
        const { status } = req.body;

        // 주문 ID로 주문을 찾아서 상태를 업데이트하고, 업데이트된 주문을 반환
        const order = await Order.findByIdAndUpdate(
            orderId,
            { status: status },
            { new: true } // 업데이트 후의 도큐먼트를 반환하도록 설정
        );

        // 주문을 찾지 못한 경우 에러를 발생시킴
        if (!order) throw new Error("Can't find order");

        // 성공적으로 업데이트된 주문을 응답으로 반환
        res.status(200).json({ status: "success", data: order });
    } catch (error) {
        // 에러가 발생한 경우 상태 코드 400과 함께 에러 메시지를 반환
        return res.status(400).json({ status: "fail", error: error.message });
    }
};

module.exports = orderController;
