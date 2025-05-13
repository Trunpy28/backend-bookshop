import Batch from '../models/BatchModel.js';
import Product from '../models/ProductModel.js';
import mongoose from 'mongoose';

const getAllBatches = async () => {
    try {
        return await Batch.find().populate('items.product').sort({ dateReceived: -1 });
    } catch (error) {
        throw new Error('Không thể lấy danh sách lô hàng.');
    }
};

const getBatchById = async (id) => {
    try {
        const batch = await Batch.findById(id).populate('items.product');
        if (!batch) {
            throw new Error('Không tìm thấy lô hàng');
        }
        return batch;
    } catch (error) {
        throw new Error(error.message || 'Không thể tìm thấy lô hàng.');
    }
};

const createBatch = async (batchData) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        // Kiểm tra dữ liệu đầu vào
        if (!batchData.supplierName) {
            throw new Error('Nhà cung cấp là bắt buộc.');
        }
        
        if (!batchData.dateReceived) {
            throw new Error('Ngày nhận hàng là bắt buộc.');
        }

        // Kiểm tra % chiết khấu
        if (batchData.discountPercentage !== undefined) {
            if (isNaN(batchData.discountPercentage) || batchData.discountPercentage < 0 || batchData.discountPercentage > 100) {
                throw new Error('Phần trăm chiết khấu phải là số từ 0 đến 100.');
            }
        }

        // Nếu có items, kiểm tra và cập nhật số lượng tồn kho
        if (batchData.items && batchData.items.length > 0) {
            for (const item of batchData.items) {
                const product = await Product.findById(item.product);
                if (!product) {
                    throw new Error(`Không tìm thấy sản phẩm với ID: ${item.product}`);
                }
                
                // Cập nhật số lượng tồn kho
                product.countInStock += item.quantity;
                await product.save({ session });
            }
        }

        const batch = new Batch(batchData);
        await batch.save({ session });

        await session.commitTransaction();
        session.endSession();

        return batch;
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
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

const addItemToBatch = async (batchId, itemData) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const batch = await Batch.findById(batchId);
        if (!batch) {
            throw new Error('Không tìm thấy lô hàng');
        }

        const itemIndex = batch.items.findIndex(item => item.product.toString() === itemData.product);
        if (itemIndex !== -1) {
            throw new Error('Sản phẩm đã tồn tại trong lô hàng');
        }

        const product = await Product.findById(itemData.product);
        if (!product) {
            throw new Error('Không tìm thấy sản phẩm');
        }

        // Cập nhật số lượng tồn kho
        product.countInStock += itemData.quantity;
        
        await product.save({ session });

        // Thêm item vào batch
        batch.items.push(itemData);
        await batch.save({ session });

        await session.commitTransaction();
        session.endSession();

        const updatedBatch = await batch.populate('items.product');
        return updatedBatch;
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw new Error(error.message || 'Không thể thêm sản phẩm vào lô hàng.');
    }
};

const removeItemFromBatch = async (batchId, itemId) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const batch = await Batch.findById(batchId);
        if (!batch) {
            throw new Error('Không tìm thấy lô hàng');
        }

        const itemIndex = batch.items.findIndex(item => item._id.toString() === itemId);
        if (itemIndex === -1) {
            throw new Error('Không tìm thấy sản phẩm trong lô hàng');
        }

        const item = batch.items[itemIndex];
        const product = await Product.findById(item.product);
        if (product) {
            // Hoàn trả số lượng tồn kho
            product.countInStock -= item.quantity;
            if (product.countInStock < 0) {
                product.countInStock = 0;
            }
            await product.save({ session });
        }

        // Xóa item khỏi batch
        batch.items.splice(itemIndex, 1);
        await batch.save({ session });

        await session.commitTransaction();
        session.endSession();

        const updatedBatch = await batch.populate('items.product');
        return updatedBatch;
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw new Error(error.message || 'Không thể xóa sản phẩm khỏi lô hàng.');
    }
};

const deleteBatch = async (id) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const batch = await Batch.findById(id);
        if (!batch) {
            throw new Error('Không tìm thấy lô hàng');
        }

        // Hoàn trả số lượng tồn kho
        for (const item of batch.items) {
            const product = await Product.findById(item.product);
            if (product) {
                product.countInStock -= item.quantity;
                if (product.countInStock < 0) {
                    product.countInStock = 0;
                }
                await product.save({ session });
            }
        }

        await Batch.findByIdAndDelete(id, { session });

        await session.commitTransaction();
        session.endSession();

        return { message: 'Xóa lô hàng thành công!' };
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw new Error(error.message || 'Không thể xóa lô hàng.');
    }
};

const getBatchesPaginated = async (page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    try {
        const batches = await Batch.find()
            .populate('items.product')
            .sort({ dateReceived: -1 })
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
    getBatchesPaginated,
    addItemToBatch,
    removeItemFromBatch
}; 