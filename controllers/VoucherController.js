import VoucherService from '../services/VoucherService.js';

const createVoucher = async (req, res) => {
  try {
    const newVoucher = await VoucherService.createVoucher(req.body);
    return res.status(200).json({
      data: newVoucher
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message
    });
  }
};

const getAllVouchers = async (req, res) => {
  try {
    const result = await VoucherService.getAllVouchers(req.query);
    
    return res.status(200).json({
      data: result.vouchers,
      pagination: result.pagination
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message
    });
  }
};

const getActiveVouchers = async (req, res) => {
  try {
    const vouchers = await VoucherService.getActiveVouchers();
    
    return res.status(200).json({
      data: vouchers
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message
    });
  }
};

const getVoucherById = async (req, res) => {
  try {
    const { id } = req.params;
    const voucher = await VoucherService.getVoucherById(id);
    
    return res.status(200).json({
      data: voucher
    });
  } catch (error) {
    return res.status(404).json({
      message: error.message
    });
  }
};

const updateVoucher = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedVoucher = await VoucherService.updateVoucher(id, req.body);
    
    return res.status(200).json({
      data: updatedVoucher
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message
    });
  }
};

const deleteVoucher = async (req, res) => {
  try {
    const { id } = req.params;
    await VoucherService.deleteVoucher(id);
    
    return res.status(200).json({
      message: 'Voucher đã được xóa thành công'
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message
    });
  }
};

const applyVoucher = async (req, res) => {
  try {
    const { code, orderValue } = req.body;
    
    const result = await VoucherService.applyVoucher(code, orderValue);
    
    return res.status(200).json({
      data: result
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message
    });
  }
}; 

export default {
  createVoucher,
  getAllVouchers,
  getActiveVouchers,
  getVoucherById,
  updateVoucher,
  deleteVoucher,
  applyVoucher,
};
