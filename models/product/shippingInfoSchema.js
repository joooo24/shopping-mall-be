const mongoose = require('mongoose');

const shippingInfoSchema = new mongoose.Schema({
    freeShipping: { type: Boolean, default: false }, // 무료 배송 여부
    shippingCost: { type: Number, default: 2500 } // 배송비
});

module.exports = shippingInfoSchema;
