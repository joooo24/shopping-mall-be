const mongoose = require('mongoose');
// const tagsSchema = require('./product/tagsSchema');
// const discountSchema = require('./product/discountSchema');
// const shippingInfoSchema = require('./product/shippingInfoSchema');
// const Review = require('./reviewSchema');

const Schema = mongoose.Schema;

const productSchema = Schema(
    {
        sku: { type: String, required: true, unique: true }, // 제품 식별 번호
        name: { type: String, required: true },
        image: { type: String, required: true },
        category: { type: [String], required: true },
        description: { type: String, required: true }, // 기본 설명
        descriptionShort: { type: String },
        descriptionLong: { type: String },
        price: { type: Number, required: true },
        stock: { type: Object, required: true },
        // tags: tagsSchema, // 태그 정보
        // discount: discountSchema, // 할인 정보
        // shippingInfo: shippingInfoSchema, // 배송 정보
        // reviews: [{ type: Schema.Types.ObjectId, ref: Review, default: [] }], // 리뷰 정보
        status: { type: String, required: true, default: "active" }, // 노출 여부
        isDelete: { type: Boolean, required: true, default: false },
    },
    { timestamps: true }
)

// toJSON 메서드 정의
productSchema.methods.toJSON = function () {
    const obj = this._doc;
    delete obj.__v;
    return obj;
};

// Product 모델 생성
const Product = mongoose.model('Product', productSchema);
module.exports = Product;