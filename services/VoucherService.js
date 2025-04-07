import Voucher from '../models/VoucherModel.js';
import mongoose from 'mongoose';
import moment from 'moment';

const createVoucher = async (data) => {
  try {
    if (!data.code) {
      throw new Error('Mã voucher không được để trống');
    }
    
    if (!data.discountType || !['percentage', 'fixed'].includes(data.discountType)) {
      throw new Error('Loại giảm giá không hợp lệ');
    }
    
    if (data.discountValue === undefined || data.discountValue === null) {
      throw new Error('Giá trị giảm giá không được để trống');
    }
    
    if (!data.startDate || !data.endDate) {
      throw new Error('Ngày bắt đầu và kết thúc không được để trống');
    }
    
    // Chuyển mã voucher thành chữ hoa
    data.code = data.code.toUpperCase();
    
    // Kiểm tra voucher đã tồn tại
    const existVoucher = await Voucher.findOne({ code: data.code });
    if (existVoucher) {
      throw new Error('Mã voucher đã tồn tại');
    }

    // Kiểm tra giá trị giảm phù hợp với loại
    if (data.discountType === 'percentage') {
      if (data.discountValue <= 0 || data.discountValue > 100) {
        throw new Error('Giá trị phần trăm giảm giá phải từ 1 đến 100');
      }
    } else if (data.discountType === 'fixed') {
      if (data.discountValue <= 0) {
        throw new Error('Giá trị giảm giá phải lớn hơn 0');
      }
    }

    // Kiểm tra giá trị đơn hàng tối thiểu
    if (data.minOrderValue < 0) {
      throw new Error('Giá trị đơn hàng tối thiểu không được âm');
    }

    // Kiểm tra thời gian hợp lệ
    if (moment(data.startDate).isAfter(moment(data.endDate))) {
      throw new Error('Thời gian bắt đầu phải trước thời gian kết thúc');
    }

    // Tạo voucher mới
    const newVoucher = await Voucher.create(data);
    return newVoucher;
  } catch (error) {
    throw new Error('Lỗi khi tạo voucher: ' + error.message);
  }
};

const getAllVouchers = async (query = {}) => {
  try {
    const queryObj = { ...query };
    const excludedFields = ['page', 'limit', 'sort'];
    excludedFields.forEach(field => delete queryObj[field]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    
    const searchQuery = JSON.parse(queryStr);
    
    // Xử lý tìm kiếm theo Active/Inactive
    if (queryObj.isActive !== undefined) {
      searchQuery.isActive = queryObj.isActive === 'true';
    }

    const page = query.page * 1 || 1;
    const limit = query.limit * 1 || 10;
    const skip = (page - 1) * limit;

    const totalVouchers = await Voucher.countDocuments(searchQuery);
    const vouchers = await Voucher.find(searchQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return {
      vouchers,
      pagination: {
        total: totalVouchers,
        page,
        limit,
        pages: Math.ceil(totalVouchers / limit)
      }
    };
  } catch (error) {
    throw new Error('Lỗi khi lấy tất cả voucher: ' + error.message);
  }
};

const getVoucherById = async (id) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('ID voucher không hợp lệ');
    }
    
    const voucher = await Voucher.findById(id);
    if (!voucher) {
      throw new Error('Voucher không tồn tại');
    }
    return voucher;
  } catch (error) {
    throw new Error('Lỗi khi lấy voucher: ' + error.message);
  }
};

const getVoucherByCode = async (code) => {
  try {
    if (!code || typeof code !== 'string') {
      throw new Error('Mã voucher không hợp lệ');
    }
    
    const upperCode = code.toUpperCase();
    const voucher = await Voucher.findOne({ 
      code: upperCode,
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    });
    
    if (!voucher) {
      throw new Error('Mã giảm giá không hợp lệ hoặc đã hết hạn');
    }

    return voucher;
  } catch (error) {
    throw new Error('Lỗi khi tìm voucher: ' + error.message);
  }
};

const updateVoucher = async (id, data) => {
  try {
    // Kiểm tra id hợp lệ
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('ID voucher không hợp lệ');
    }
    
    // Kiểm tra voucher tồn tại
    const existingVoucher = await Voucher.findById(id);
    if (!existingVoucher) {
      throw new Error('Voucher không tồn tại');
    }
    
    // Chuyển mã voucher thành chữ hoa nếu có
    if (data.code) {
      data.code = data.code.toUpperCase();
      
      // Kiểm tra voucher đã tồn tại (nếu thay đổi code)
      const duplicateVoucher = await Voucher.findOne({ 
        code: data.code, 
        _id: { $ne: id } 
      });

      if (duplicateVoucher) {
        throw new Error('Mã voucher đã tồn tại');
      }
    }

    // Kiểm tra giá trị giảm phù hợp với loại
    if (data.discountType === 'percentage' && data.discountValue !== undefined) {
      if (data.discountValue <= 0 || data.discountValue > 100) {
        throw new Error('Giá trị phần trăm giảm giá phải từ 1 đến 100');
      }
    }

    if (data.discountType === 'fixed' && data.discountValue !== undefined) {
      if (data.discountValue <= 0) {
        throw new Error('Giá trị giảm giá phải lớn hơn 0');
      }
    }

    // Kiểm tra giá trị đơn hàng tối thiểu
    if (data.minOrderValue !== undefined && data.minOrderValue < 0) {
      throw new Error('Giá trị đơn hàng tối thiểu không được âm');
    }

    // Kiểm tra thời gian hợp lệ nếu có cập nhật
    if (data.startDate && data.endDate) {
      if (moment(data.startDate).isAfter(moment(data.endDate))) {
        throw new Error('Thời gian bắt đầu phải trước thời gian kết thúc');
      }
    } else if (data.startDate && !data.endDate) {
      if (moment(data.startDate).isAfter(moment(existingVoucher.endDate))) {
        throw new Error('Thời gian bắt đầu phải trước thời gian kết thúc');
      }
    } else if (!data.startDate && data.endDate) {
      if (moment(existingVoucher.startDate).isAfter(moment(data.endDate))) {
        throw new Error('Thời gian bắt đầu phải trước thời gian kết thúc');
      }
    }

    // Cập nhật voucher
    const updatedVoucher = await Voucher.findByIdAndUpdate(
      id, 
      data, 
      { new: true, runValidators: true }
    );
    
    return updatedVoucher;
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      const errors = Object.values(error.errors).map(err => err.message);
      throw new Error(errors.join(', '));
    }
    throw new Error('Lỗi khi cập nhật voucher: ' + error.message) ;
  }
};

const deleteVoucher = async (id) => {
  try {
    // Kiểm tra id hợp lệ
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('ID voucher không hợp lệ');
    }
    
    const voucher = await Voucher.findByIdAndDelete(id);
    if (!voucher) {
      throw new Error('Voucher không tồn tại');
    }
    return voucher;
  } catch (error) {
    throw new Error('Lỗi khi xóa voucher: ' + error.message)  ;
  }
};

const applyVoucher = async (code, orderValue) => {
  try {
    if (!code || typeof code !== 'string') {
      throw new Error('Mã voucher không hợp lệ');
    }
    
    if (orderValue === undefined || orderValue === null || isNaN(orderValue) || orderValue < 0) {
      throw new Error('Giá trị đơn hàng không hợp lệ');
    }

    const voucher = await getVoucherByCode(code);

    // Kiểm tra giá trị đơn hàng tối thiểu
    if (orderValue < voucher.minOrderValue) {
      throw new Error(`Giá trị đơn hàng phải từ ${voucher.minOrderValue.toLocaleString('vi-VN')}đ trở lên`);
    }

    // Tính toán giảm giá
    let discountAmount = 0;
    
    if (voucher.discountType === 'percentage') {
      discountAmount = Math.round((orderValue * voucher.discountValue) / 100);
    } else {
      // Loại fixed - giảm trực tiếp số tiền
      discountAmount = voucher.discountValue;
    }
    
    // Đảm bảo số tiền giảm không vượt quá giá trị đơn hàng
    if (discountAmount > orderValue) {
      discountAmount = orderValue;
    }
    
    return {
      voucher,
      discountAmount,
      finalPrice: orderValue - discountAmount
    };
  } catch (error) {
    throw new Error('Lỗi khi áp dụng voucher: ' + error.message);
  }
};

const getActiveVouchers = async () => {
  try {
    // Lấy tất cả các voucher còn hiệu lực và sắp có hiệu lực
    const now = new Date();
    const vouchers = await Voucher.find({
      isActive: true,
      endDate: { $gte: now }
    }).sort({ startDate: 1 });

    return vouchers;
  } catch (error) {
    throw new Error('Lỗi khi lấy danh sách voucher: ' + error.message);
  }
};

export default {
  createVoucher,
  getAllVouchers,
  getVoucherById,
  getVoucherByCode,
  updateVoucher,
  deleteVoucher,
  applyVoucher,
  getActiveVouchers,
};
