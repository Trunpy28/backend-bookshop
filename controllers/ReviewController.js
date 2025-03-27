import ReviewService from '../services/ReviewService.js';

const createReview = async (req, res) => {
  try {
    const review = await ReviewService.createReview(req.body);
    res.status(201).json({ message: 'Tạo đánh giá thành công', data: review });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi tạo đánh giá', error: error.message });
  }
};

const updateReview = async (req, res) => {
  try {
    const updatedReview = await ReviewService.updateReview(req.params.id, req.body);
    res.status(200).json({ message: 'Cập nhật đánh giá thành công', data: updatedReview });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi cập nhật đánh giá', error: error.message });
  }
};

const deleteReview = async (req, res) => {
  try {
    await ReviewService.deleteReview(req.params.id);
    res.status(200).json({ message: 'Xóa đánh giá thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa đánh giá', error: error.message });
  }
};

export default {
  createReview,
  updateReview,
  deleteReview
};