import Inventory from '../models/InventoryModel.js';
import Product from '../models/ProductModel.js';
import mongoose from 'mongoose';

const getAllInventory = async () => {
    try {
        return await Inventory.find().populate('product', "_id name genre").populate('batch');
    } catch (error) {
        throw new Error('Không thể lấy danh sách kho.');
    }
};

const getInventoryById = async (id) => {
    try {
        return await Inventory.findById(id).populate('product', "_id name genre").populate('batch');
    } catch (error) {
        throw new Error('Không thể tìm thấy thông tin kho.');
    }
};

const addInventory = async (inventoryData) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        if (!inventoryData.product || !inventoryData.batch || !inventoryData.quantity) {
            throw new Error('Thiếu thông tin bắt buộc.');
        }

        // Kiểm tra product tồn tại
        const product = await Product.findById(inventoryData.product);
        if (!product) {
            throw new Error('Không tìm thấy sản phẩm');
        }

        // Kiểm tra số lượng hợp lệ
        if (inventoryData.quantity < 0) {
            throw new Error('Số lượng không được âm');
        }
        
        const inventory = new Inventory(inventoryData);
        await inventory.save({ session });

        // Cập nhật countInStock của product (cộng thêm)
        product.countInStock += inventoryData.quantity;
        await product.save({ session });

        await session.commitTransaction();
        session.endSession();

        return inventory;
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw new Error(error.message || 'Không thể thêm vào kho.');
    }
};

const deleteInventory = async (id) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        // Kiểm tra inventory tồn tại
        const inventory = await Inventory.findById(id);
        if (!inventory) {
            throw new Error('Không tìm thấy thông tin kho');
        }

        // Kiểm tra product tồn tại
        const product = await Product.findById(inventory.product);
        if (!product) {
            throw new Error('Không tìm thấy sản phẩm');
        }

        // Kiểm tra nếu trừ đi sẽ âm
        if (product.countInStock - inventory.quantity < 0) {
            product.countInStock = 0;
        }
        else {
            // Cập nhật countInStock của product (trừ đi)
            product.countInStock -= inventory.quantity;
        }

        // Xóa inventory
        await Inventory.findByIdAndDelete(id, { session });

        await product.save({ session });

        await session.commitTransaction();
        session.endSession();

        return { message: 'Xóa thông tin kho thành công' };
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw new Error(error.message || 'Không thể xóa thông tin kho.');
    }
};

const getInventoriesPaginated = async (page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    try {
        const inventories = await Inventory.find()
            .skip(skip)
            .limit(limit)
            .populate('product', "_id name genre")
            .populate('batch');
        const total = await Inventory.countDocuments();
        return { inventories, total };
    } catch (error) {
        throw new Error('Không thể lấy danh sách kho hàng.');
    }
};

export default {
    getAllInventory,
    getInventoryById,
    addInventory,
    deleteInventory,
    getInventoriesPaginated
};