import Batch from '../models/BatchModel.js';

const getAllBatches = async () => {
    try {
        return await Batch.find();
    } catch (error) {
        throw new Error('Không thể lấy danh sách lô hàng.');
    }
};

const getBatchById = async (id) => {
    try {
        return await Batch.findById(id);
    } catch (error) {
        throw new Error('Không thể tìm thấy lô hàng.');
    }
};

const createBatch = async (batchData) => {
    try {
        // Kiểm tra dữ liệu đầu vào
        if (!batchData.supplierName) {
            throw new Error('Nhà cung cấp là bắt buộc.');
        }
        
        // Kiểm tra % chiết khấu
        if (batchData.discountPercentage !== undefined) {
            if (isNaN(batchData.discountPercentage) || batchData.discountPercentage < 0 || batchData.discountPercentage > 100) {
                throw new Error('Phần trăm chiết khấu phải là số từ 0 đến 100.');
            }
        }
        
        const batch = new Batch(batchData);
        return await batch.save();
    } catch (error) {
        throw new Error(error.message || 'Không thể tạo lô hàng mới.');
    }
};

const updateBatch = async (id, batchData) => {
    try {
        // Kiểm tra % chiết khấu
        if (batchData.discountPercentage !== undefined) {
            if (isNaN(batchData.discountPercentage) || batchData.discountPercentage < 0 || batchData.discountPercentage > 100) {
                throw new Error('Phần trăm chiết khấu phải là số từ 0 đến 100.');
            }
        }
        
        return await Batch.findByIdAndUpdate(id, batchData, { new: true });
    } catch (error) {
        throw new Error(error.message || 'Không thể cập nhật lô hàng.');
    }
};

const deleteBatch = async (id) => {
    try {
        return await Batch.findByIdAndDelete(id);
    } catch (error) {
        throw new Error('Không thể xóa lô hàng.');
    }
};

const getBatchesPaginated = async (page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    try {
        const batches = await Batch.find()
            .skip(skip)
            .limit(limit);
        const total = await Batch.countDocuments();
        return { batches, total };
    } catch (error) {
        throw new Error('Không thể lấy danh sách lô hàng.');
    }
};

export default {
    getAllBatches,
    getBatchById,
    createBatch,
    updateBatch,
    deleteBatch,
    getBatchesPaginated
}; 