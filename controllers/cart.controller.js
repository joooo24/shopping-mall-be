const Cart = require("../models/Cart");

const cartController = {};

// 장바구니 아이템 추가
cartController.addItemToCart = async (req, res) => {
    try {
        const { userId } = req;
        const { productId, option, qty } = req.body;

        // 유저를 가지고 카트 찾기
        let cart = await Cart.findOne({ userId });

        // 유저가 만든 카트가 없다면 만들기
        if (!cart) {
            cart = new Cart({ userId });
            await cart.save();
        }

        // 이미 카트에 들어가 있는 아이템인지 확인하기 -> 맞으면 에러
        const existItem = cart.items.find(
            // -> productId가 몽구스에서 사용하는 _id 값이여서 equals로 비교
            (item) => item.productId.equals(productId) && item.option === option
        );

        if (existItem) throw new Error("해당 상품이 이미 장바구니에 담겨있습니다.");

        // 카트에 아이템을 추가
        cart.items = [...cart.items, { productId, option, qty }];

        await cart.save();

        return res.status(200).json({ status: "success", data: cart, cartItemQty: cart.items.length });
    } catch (err) {
        res.status(500).json({ status: "fail", error: err, message: err.message });
    }
};

// 장바구니 아이템 가져오기
cartController.getItemToCart = async (req, res) => {
    try {
        const { userId } = req;

        // serId에 해당하는 cart 찾기 + items의 productId로 Product 정보 함께
        const cart = await Cart.findOne({ userId }).populate({
            path: "items", // populate 할 필드
            populate: {
                path: "productId", // 참조하는 객체의 필드
                model: "Product", // 참조할 모델의 이름
            },
        });

        if (!cart) {
            // 장바구니가 비어있을 때는 실패 상태 코드 반환
            return res.status(500).json({ status: "fail", message: "장바구니가 비어 있습니다." });
        }

        return res.status(200).json({ status: "success", data: cart });
    } catch (err) {
        res.status(500).json({ status: "fail", error: err, message: err.message });
    }
};

// 장바구니 아이템 전체 삭제
cartController.emptyCart = async (req, res) => {
    try {
        const { userId } = req;

        // 해당 유저의 장바구니 삭제
        await Cart.deleteOne({ userId });

        return res.status(200).json({ status: "success", message: "장바구니가 비워졌습니다." });
    } catch (err) {
        res.status(500).json({ status: "fail", error: err, message: err.message });
    }
};

// 장바구니 아이템 삭제
cartController.deleteCartItem = async (req, res) => {
    try {
        const { userId } = req;
        const { id: cartItemId } = req.params;

        const cart = await Cart.findOne({ userId });
        cart.items = cart.items.filter((item) => !item._id.equals(cartItemId));

        await cart.save();
        res.status(200).json({ status: 200, cartItemQty: cart.items.length });
    } catch (error) {
        return res.status(400).json({ status: "fail", error: error.message });
    }
};

// 장바구니 아이템 수량 변경
cartController.editCartItem = async (req, res) => {
    try {
        const { userId } = req;
        const { id } = req.params;
        
        const { qty } = req.body;

        // userId로 사용자의 장바구니를 찾고, items와 해당 items의 productId를 populate 함
        const cart = await Cart.findOne({ userId }).populate({
            path: "items",
            populate: {
                path: "productId",
                model: "Product",
            },
        });

        if (!cart) throw new Error("There is no cart for this user");

        // 장바구니 항목 배열에서 특정 항목의 인덱스를 찾음
        const index = cart.items.findIndex((item) => item._id.equals(id));

        // 해당 항목을 찾지 못한 경우 에러
        if (index === -1) throw new Error("Can not find item");

        // 항목의 수량을 업데이트 함
        cart.items[index].qty = qty;

        // 변경된 장바구니 저장
        await cart.save();
        res.status(200).json({ status: 200, data: cart.items });
    } catch (error) {
        return res.status(400).json({ status: "fail", error: error.message });
    }
};

// 장바구니 아이템 수량 가져오기
cartController.getCartQty = async (req, res) => {
    try {
        const { userId } = req;
        const cart = await Cart.findOne({ userId: userId });

        if (!cart) throw new Error("There is no cart!");

        res.status(200).json({ status: 200, qty: cart.items.length });
    } catch (err) {
        return res.status(400).json({ status: "fail", error: err.message });
    }
};

module.exports = cartController;
