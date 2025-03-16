import Review from '../models/ReviewModel.js';
import mongoose from 'mongoose';

const getAllReviews = async () => {
    try {
        return await Review.find();
    } catch (error) {
        throw new Error('Không thể lấy danh sách đánh giá.');
    }
};

const getReviewById = async (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('ID không hợp lệ.');
    }
    try {
        const review = await Review.findById(id);
        if (!review) {
            throw new Error('Đánh giá không tồn tại.');
        }
        return review;
    } catch (error) {
        throw new Error('Không thể tìm thấy đánh giá.');
    }
};

const createReview = async (reviewData) => {
    if (!reviewData.content || !reviewData.rating) {
        throw new Error('Nội dung và đánh giá là bắt buộc.');
    }
    if (typeof reviewData.rating !== 'number' || reviewData.rating < 1 || reviewData.rating > 5) {
        throw new Error('Đánh giá phải là một số từ 1 đến 5.');
    }
    try {
        const review = new Review(reviewData);
        return await review.save();
    } catch (error) {
        throw new Error('Không thể tạo đánh giá mới.');
    }
};

const updateReview = async (id, reviewData) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('ID không hợp lệ.');
    }
    if (!reviewData.content || !reviewData.rating) {
        throw new Error('Nội dung và đánh giá là bắt buộc.');
    }
    if (typeof reviewData.rating !== 'number' || reviewData.rating < 1 || reviewData.rating > 5) {
        throw new Error('Đánh giá phải là một số từ 1 đến 5.');
    }
    try {
        const updatedReview = await Review.findByIdAndUpdate(id, reviewData, { new: true });
        if (!updatedReview) {
            throw new Error('Đánh giá không tồn tại.');
        }
        return updatedReview;
    } catch (error) {
        throw new Error('Không thể cập nhật đánh giá.');
    }
};

const deleteReview = async (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('ID không hợp lệ.');
    }
    try {
        const deletedReview = await Review.findByIdAndDelete(id);
        if (!deletedReview) {
            throw new Error('Đánh giá không tồn tại.');
        }
        return deletedReview;
    } catch (error) {
        throw new Error('Không thể xóa đánh giá.');
    }
};

export default {
    getAllReviews,
    getReviewById,
    createReview,
    updateReview,
    deleteReview
};