const mongoose = require("mongoose");
const Product = require("./Product");
const User = require("./User");

const Schema = mongoose.Schema;

const cartSchema = Schema(
    {
        userId: { type: mongoose.ObjectId, ref: User },
        items: [
            {
                productId: { type: mongoose.ObjectId, ref: Product },
                option: { type: String, required: true },
                qty: { type: Number, required: true, default: 1 },
            },
        ],
    },
    { timestamps: true }
);

// toJSON 메서드 정의
cartSchema.methods.toJSON = function () {
    const obj = this._doc;
    delete obj.__v;
    return obj;
};

// Cart 모델 생성
const Cart = mongoose.model("Cart", cartSchema);
module.exports = Cart;
