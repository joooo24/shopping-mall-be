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

module.exports = cartController;
