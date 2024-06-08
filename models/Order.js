const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('./User');
const Cart = require('./Cart');

const orderSchema = Schema(
    {
        userId: { type: mongoose.ObjectId, ref: User, required: true }, // 주문한 사용자의 ID
        status: { type: String, default: "preparing" },
        // status: { // 주문 상태 (보류, 처리 중, 발송됨, 배달됨, 취소됨)
        //     type: String, 
        //     required: true, 
        //     enum: ['pending', 'preparing',  'processing', 'shipped', 'delivered', 'cancelled'], 
        //     default: 'pending'
        // },
        totalPrice: { type: Number, required: true, default: 0 }, // 총 주문 가격
        cartId: { type: mongoose.ObjectId, ref: Cart, required: true }, // 주문에 대한 장바구니 ID
        shipTo: { type: Object, required: true },
        contact: { type: Object, required: true },
        orderNum: { type: String },
        items: [
            {
                productId: { type: mongoose.ObjectId, ref: Product, required: true },
                price: { type: Number, required: true },
                qty: { type: Number, required: true, default: 1 },
                option: { type: String, required: true },
            },
        ],
        // paymentMethod: {
        //     type: String,
        //     required: true,
        //     enum: ['credit_card', 'paypal', 'bank_transfer'] // 결제 방법 (신용카드, 페이팔, 무통장 입금)
        // },
    },
    { timestamps: true }
);

// toJSON 메서드 정의
orderSchema.methods.toJSON = function () {
    const obj = this._doc;
    delete obj.__v;
    delete obj.updatedAt;
    return obj;
};

// Order 모델 생성
const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
