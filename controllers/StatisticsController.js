import StatisticsService from '../services/StatisticsService.js';

const getGeneralStatistics = async (req, res) => {
  try {
    const statistics = await StatisticsService.getGeneralStatistics();
    return res.status(200).json(statistics);
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};

const getRatingStatistics = async (req, res) => {
  try {
    const statistics = await StatisticsService.getRatingStatistics();
    return res.status(200).json(statistics);
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};

const getOrderStatusStatistics = async (req, res) => {
  try {
    const statistics = await StatisticsService.getOrderStatusStatistics();
    return res.status(200).json(statistics);
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};

const getPaymentStatistics = async (req, res) => {
  try {
    const statistics = await StatisticsService.getPaymentStatistics();
    return res.status(200).json(statistics);
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};

const getRevenueByMonth = async (req, res) => {
  try {
    const { month, year } = req.query;
    
    // Nếu không có tháng và năm, sử dụng tháng và năm hiện tại
    const currentDate = new Date();
    
    const currentMonth = month ? parseInt(month) : currentDate.getMonth() + 1;
    
    // Đảm bảo năm là số nguyên hợp lệ
    const currentYear = year ? parseInt(year) : currentDate.getFullYear();
    
    // Gọi service với tháng thực tế (1-12) và năm
    const result = await StatisticsService.getRevenueByMonth(currentMonth, currentYear);
    
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({
      message: error.message
    });
  }
};

const getRevenueByYear = async (req, res) => {
  try {
    const { year } = req.query;
    
    // Nếu không có năm, sử dụng năm hiện tại
    const currentDate = new Date();
    
    // Đảm bảo năm là số nguyên hợp lệ
    const currentYear = year ? parseInt(year) : currentDate.getFullYear();
    
    const result = await StatisticsService.getRevenueByYear(currentYear);
    
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({
      message: error.message
    });
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