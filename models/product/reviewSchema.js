const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // 리뷰 작성자
    rating: { type: Number, required: true }, // 리뷰 평점
    comment: { type: String, required: true }, // 리뷰 내용
    createdAt: { type: Date, default: Date.now } // 리뷰 작성 날짜
}, { timestamps: true });

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
