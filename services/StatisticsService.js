import User from "../models/UserModel.js";
import Product from "../models/ProductModel.js";
import Order from "../models/OrderModel.js";
import Voucher from "../models/VoucherModel.js";
import Batch from "../models/BatchModel.js";
import Genre from "../models/GenreModel.js";
import Payment from "../models/PaymentModel.js";
import Review from "../models/ReviewModel.js";
import dayjs from 'dayjs';

const getGeneralStatistics = async () => {
  try {
    // Lấy tổng số tài khoản người dùng
    const totalUsers = await User.countDocuments();
    
    // Lấy tổng số lô đã nhập
    const totalBatches = await Batch.countDocuments();
    
    // Lấy số mã giảm giá đang có hiệu lực
    const currentDate = new Date();
    const activeVouchers = await Voucher.countDocuments({
      isActive: true,
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate }
    });
    
    // Lấy tổng số đơn hàng
    const totalOrders = await Order.countDocuments();
    
    // Lấy tổng số sách
    const totalBooks = await Product.countDocuments();

    // Lấy tổng số thể loại
    const totalGenres = await Genre.countDocuments();

    // Lấy tổng doanh thu từ các đơn hàng đã thanh toán
    const paymentStats = await Payment.aggregate([
      { $match: { status: 'Completed' } },
      { $group: { _id: null, totalRevenue: { $sum: '$amount' } } }
    ]);
    const totalRevenue = paymentStats.length > 0 ? paymentStats[0].totalRevenue : 0;

    // Lấy tổng số lượt đánh giá
    const totalReviews = await Review.countDocuments();
    
    return {
      totalUsers,
      totalBatches,
      activeVouchers,
      totalOrders,
      totalBooks,
      totalGenres,
      totalRevenue,
      totalReviews
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

const getRatingStatistics = async () => {
  try {
    // Thống kê đánh giá theo số sao
    const ratingStats = await Review.aggregate([
      { $group: { _id: '$rating', count: { $sum: 1 } } }
    ]);
    
    const ratingData = {
      oneStar: 0,
      twoStars: 0,
      threeStars: 0,
      fourStars: 0,
      fiveStars: 0
    };
    
    ratingStats.forEach(rating => {
      if (rating._id === 1) ratingData.oneStar = rating.count;
      if (rating._id === 2) ratingData.twoStars = rating.count;
      if (rating._id === 3) ratingData.threeStars = rating.count;
      if (rating._id === 4) ratingData.fourStars = rating.count;
      if (rating._id === 5) ratingData.fiveStars = rating.count;
    });
    
    return { ratingData };
  } catch (error) {
    throw new Error(error.message);
  }
};

const getOrderStatusStatistics = async () => {
  try {
    // Thống kê trạng thái đơn hàng
    const orderStatusStats = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }    // Field count là số lượng đơn hàng theo trạng thái, $sum: 1 là cọng mỗi document thêm 1 cho count
    ]);
    
    const orderStatusData = {
      pending: 0,
      shipping: 0,
      delivered: 0,
      cancelled: 0
    };
    
    orderStatusStats.forEach(status => {
      if (status._id === 'Pending') orderStatusData.pending = status.count;
      if (status._id === 'Shipping') orderStatusData.shipping = status.count;
      if (status._id === 'Delivered') orderStatusData.delivered = status.count;
      if (status._id === 'Cancelled') orderStatusData.cancelled = status.count;
    });
    
    return { orderStatusData };
  } catch (error) {
    throw new Error(error.message);
  }
};

const getPaymentStatistics = async () => {
  try {
    // Thống kê phương thức thanh toán
    const paymentMethodStats = await Payment.aggregate([
      { $group: { _id: '$paymentMethod', count: { $sum: 1 } } }
    ]);
    
    const paymentMethodData = {
      cod: 0,
      vnpay: 0,
      paypal: 0
    };
    
    paymentMethodStats.forEach(method => {
      if (method._id === 'COD') paymentMethodData.cod = method.count;
      if (method._id === 'VNPAY') paymentMethodData.vnpay = method.count;
      if (method._id === 'PAYPAL') paymentMethodData.paypal = method.count;
    });
    
    // Thống kê trạng thái thanh toán
    const paymentStatusStats = await Payment.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    const paymentStatusData = {
      pending: 0,
      completed: 0,
      failed: 0
    };
    
    paymentStatusStats.forEach(status => {
      if (status._id === 'Pending') paymentStatusData.pending = status.count;
      if (status._id === 'Completed') paymentStatusData.completed = status.count;
      if (status._id === 'Failed') paymentStatusData.failed = status.count;
    });
    
    return { 
      paymentMethodData,
      paymentStatusData
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

const getRevenueByMonth = async (month, year) => {
  try {
    // Kiểm tra tham số đầu vào
    const currentMonth = parseInt(month);
    const currentYear = parseInt(year);
    
    if (isNaN(currentMonth) || currentMonth < 1 || currentMonth > 12) {
      throw new Error('Tháng không hợp lệ');
    }
    
    // Tạo ngày đầu và cuối tháng
    const startDate = new Date(currentYear, currentMonth - 1, 1);
    const endDate = new Date(currentYear, currentMonth, 0); // Ngày cuối cùng của tháng
    
    // Lấy số ngày trong tháng
    const daysInMonth = endDate.getDate();
    
    // Thống kê doanh thu theo ngày
    const dailyRevenue = await Payment.aggregate([
      {
        $match: {
          status: 'Completed',
          paidAt: {
            $gte: startDate,
            $lte: new Date(currentYear, currentMonth - 1, daysInMonth, 23, 59, 59)
          }
        }
      },
      {
        $group: {
          // _id: Trường bắt buộc để xác định cách nhóm, ở đây nhóm theo ngày trong tháng
          // $dayOfMonth: Trích xuất số ngày (1-31) từ trường paidAt (dạng Date)
          // '$paidAt': Tham chiếu đến trường paidAt trong collection
          _id: { $dayOfMonth: '$paidAt' },
          // '$amount': Tham chiếu đến trường amount trong collection
          totalRevenue: { $sum: '$amount' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    // Tạo mảng dữ liệu cho tất cả các ngày trong tháng đảm bảo trả về dữ liệu đầy đủ cho tất cả các ngày, kể cả ngày không có doanh thu
    const result = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const found = dailyRevenue.find(item => item._id === day);
      result.push({
        day: day,
        revenue: found ? found.totalRevenue : 0
      });
    }
    
    return {
      month: currentMonth,
      year: currentYear,
      data: result
    };
  } catch (error) {
    throw new Error(`Lỗi khi thống kê doanh thu theo tháng: ${error.message}`);
  }
};

const getRevenueByYear = async (year) => {
  try {
    // Kiểm tra tham số đầu vào
    const currentYear = parseInt(year);
    
    if (isNaN(currentYear) || currentYear < 2000 || currentYear > 2100) {
      throw new Error('Năm không hợp lệ');
    }
    
    // Tạo ngày đầu và cuối năm
    const startDate = new Date(currentYear, 0, 1);
    const endDate = new Date(currentYear, 11, 31, 23, 59, 59);
    
    // Thống kê doanh thu theo tháng
    const monthlyRevenue = await Payment.aggregate([
      {
        $match: {
          status: 'Completed',
          paidAt: {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      {
        $group: {
          // _id: Trường bắt buộc để xác định cách nhóm, ở đây nhóm theo tháng trong năm
          // $month: Trích xuất số tháng (1-12) từ trường paidAt (dạng Date)
          // '$paidAt': Tham chiếu đến trường paidAt trong collection
          _id: { $month: '$paidAt' },
          // '$amount': Tham chiếu đến trường amount trong collection
          totalRevenue: { $sum: '$amount' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    // Tạo mảng dữ liệu cho tất cả các tháng trong năm
    // Mục đích: Đảm bảo trả về dữ liệu đầy đủ cho tất cả 12 tháng, kể cả tháng không có doanh thu
    const result = [];
    for (let month = 1; month <= 12; month++) {
      const found = monthlyRevenue.find(item => item._id === month);
      result.push({
        month: month,
        revenue: found ? found.totalRevenue : 0
      });
    }
    
    return {
      year: currentYear,
      data: result
    };
  } catch (error) {
    throw new Error(`Lỗi khi thống kê doanh thu theo năm: ${error.message}`);
  }
};

export default {
  getGeneralStatistics,
  getRatingStatistics,
  getOrderStatusStatistics,
  getPaymentStatistics,
  getRevenueByMonth,
  getRevenueByYear
}; 