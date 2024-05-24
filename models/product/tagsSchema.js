const mongoose = require('mongoose');

const tagsSchema = new mongoose.Schema({
    newProduct: { type: Boolean, default: false },
    md: { type: Boolean, default: false },
    sale: { type: Boolean, default: false },
    freeShipping: { type: Boolean, default: false },
    event: { type: Boolean, default: false },
    coupon: { type: Boolean, default: false },
});

module.exports = tagsSchema;
