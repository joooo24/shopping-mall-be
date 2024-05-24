const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('./User');
const Cart = require('./Cart');

const orderSchema = Schema(
    {
        userId: { type: mongoose.ObjectId, ref: User, required: true }, // 주문한 사용자의 ID
        cartId: { type: mongoose.ObjectId, ref: Cart, required: true }, // 주문에 대한 장바구니 ID
        totalPrice: { type: Number, required: true }, // 총 주문 가격
        status: { 
            type: String, 
            required: true, 
            enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], // 주문 상태 (보류, 처리 중, 발송됨, 배달됨, 취소됨)
            default: 'pending'
        },
        paymentMethod: { 
            type: String, 
            required: true,
            enum: ['credit_card', 'paypal', 'bank_transfer'] // 결제 방법 (신용카드, 페이팔, 무통장 입금)
        }, 
        shippingAddress: { 
            type: String, 
            required: true 
        }, // 배송 주소
        shippingFee: { type: Number, required: true }, // 배송비
    },
    { timestamps: true }
);

// toJSON 메서드 정의
orderSchema.methods.toJSON = function () {
    const obj = this._doc;
    delete obj.__v;
    return obj;
};

// Order 모델 생성
const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
