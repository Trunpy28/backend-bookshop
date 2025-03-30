import ReviewService from '../services/ReviewService.js';

const createReview = async (req, res) => {
  let reviewData = req.body;
  reviewData.user = req.user.id;
  reviewData.product = req.params.productId;

  try {
    const review = await ReviewService.createReview(reviewData);
    res.status(201).json({ message: 'Tạo đánh giá thành công', data: review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteReview = async (req, res) => {
  try {
    await ReviewService.deleteReview(req.user.id, req.params.reviewId);
    res.status(200).json({ message: 'Xóa đánh giá thành công' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getReviewsByProductId = async (req, res) => {
  try {
    const reviews = await ReviewService.getReviewsByProductId(req.params.productId);
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export default {
  createReview,
  deleteReview,
  getReviewsByProductId
};