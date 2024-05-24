const mongoose = require('mongoose');

const discountSchema = new mongoose.Schema({
    amount: { type: Number, default: 0 }, // 할인 금액
    percentage: { type: Number, default: 0 }, // 할인 비율
    validUntil: { type: Date } // 할인 유효 기간
});

module.exports = discountSchema;
