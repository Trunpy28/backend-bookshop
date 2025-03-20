import Review from '../models/ReviewModel.js';
import Product from '../models/ProductModel.js';
import mongoose from 'mongoose';

const getAllReviews = async () => {
    try {
        return await Review.find().populate('user', 'name email');
    } catch (error) {
        throw new Error('Không thể lấy danh sách đánh giá.');
    }
};

const getReviewById = async (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('ID không hợp lệ.');
    }
    try {
        const review = await Review.findById(id).populate('user', 'name email');
        if (!review) {
            throw new Error('Đánh giá không tồn tại.');
        }
        return review;
    } catch (error) {
        throw new Error('Không thể tìm thấy đánh giá.');
    }
};

const getReviewsByProductId = async (productId) => {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw new Error('ID sản phẩm không hợp lệ.');
    }
    try {
        const reviews = await Review.find({ product: productId })
            .populate('user', 'name email')
            .sort({ createdAt: -1 });
        return reviews;
    } catch (error) {
        throw new Error('Không thể lấy đánh giá cho sản phẩm này.');
    }
};

const calculateProductRating = async (productId) => {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw new Error('ID sản phẩm không hợp lệ.');
    }
    
    try {
        const result = await Review.aggregate([
            { $match: { product: new mongoose.Types.ObjectId(productId) } },
            { 
                $group: { 
                    _id: "$product",
                    avgRating: { $avg: "$rating" },
                    totalReviews: { $sum: 1 }
                } 
            }
        ]);
        
        let ratingData = { avgRating: 0, totalReviews: 0 };
        
        if (result.length > 0) {
            ratingData = {
                avgRating: parseFloat(result[0].avgRating.toFixed(1)),
                totalReviews: result[0].totalReviews
            };
        }
        
        await Product.findByIdAndUpdate(
            productId,
            { 
                $set: { 
                    rating: ratingData
                } 
            }
        );
        
        return ratingData;
    } catch (error) {
        throw new Error('Không thể tính rating cho sản phẩm: ' + error.message);
    }
};

const createReview = async (reviewData) => {
    if (!reviewData.comment || !reviewData.rating || !reviewData.product || !reviewData.user) {
        throw new Error('Thiếu thông tin bắt buộc để tạo đánh giá.');
    }

    reviewData.rating = Number(reviewData.rating);

    if (isNaN(reviewData.rating) || reviewData.rating < 1 || reviewData.rating > 5) {
        throw new Error('Đánh giá phải là một số từ 1 đến 5.');
    }
    
    try {
        const existingReview = await Review.findOne({
            product: reviewData.product,
            user: reviewData.user
        });
        
        if (existingReview) {
            throw new Error('Bạn đã đánh giá sản phẩm này rồi.');
        }
        
        const review = new Review(reviewData);
        const savedReview = await review.save();
        
        await calculateProductRating(reviewData.product);
        
        return savedReview;
    } catch (error) {
        throw new Error('Không thể tạo đánh giá mới: ' + error.message);
    }
};

const updateReview = async (id, reviewData) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('ID không hợp lệ.');
    }
    if (!reviewData.comment || !reviewData.rating) {
        throw new Error('Nội dung và đánh giá là bắt buộc.');
    }
    reviewData.rating = Number(reviewData.rating);
    if (isNaN(reviewData.rating) || reviewData.rating < 1 || reviewData.rating > 5) {
        throw new Error('Đánh giá phải là một số từ 1 đến 5.');
    }
    
    try {
        const review = await Review.findById(id);
        if (!review) {
            throw new Error('Đánh giá không tồn tại.');
        }
        
        const updatedReview = await Review.findByIdAndUpdate(id, reviewData, { new: true });
        
        await calculateProductRating(review.product);
        
        return updatedReview;
    } catch (error) {
        throw new Error('Không thể cập nhật đánh giá: ' + error.message);
    }
};

const deleteReview = async (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('ID không hợp lệ.');
    }
    try {
        const review = await Review.findById(id);
        if (!review) {
            throw new Error('Đánh giá không tồn tại.');
        }
        
        const productId = review.product;
        
        await Review.findByIdAndDelete(id);
        
        await calculateProductRating(productId);
        
        return { message: 'Đã xóa đánh giá thành công.' };
    } catch (error) {
        throw new Error('Không thể xóa đánh giá: ' + error.message);
    }
};

export default {
    getAllReviews,
    getReviewById,
    getReviewsByProductId,
    createReview,
    updateReview,
    deleteReview,
    calculateProductRating
};