const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

const Schema = mongoose.Schema;

const userSchema = Schema(
    {
        email: { type: String, required: true },
        password: { type: String, required: true },
        name: { type: String, required: true },
        membership: { type: Number, required: true, default: 0 },
        level: { type: String, required: true, default: "customer" }, // admin || customer
    },
    { timestamps: true }
)

// // toJSON 메서드 정의
userSchema.methods.toJSON = function () {
    const obj = this._doc;
    delete obj.password
    delete obj.__v
    return obj;
}

// 토큰 생성
userSchema.methods.generateToken = function () {
    const token = jwt.sign({ _id: this._id }, JWT_SECRET_KEY, { expiresIn: '1h' });
    return token;
};

// User 모델 생성
const User = mongoose.model('User', userSchema);
module.exports = User;