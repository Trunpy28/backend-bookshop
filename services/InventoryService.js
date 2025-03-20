import Inventory from '../models/InventoryModel.js';

const getAllInventory = async () => {
    try {
        return await Inventory.find().populate('product').populate('batch');
    } catch (error) {
        throw new Error('Không thể lấy danh sách kho.');
    }
};

const getInventoryById = async (id) => {
    try {
        return await Inventory.findById(id).populate('product').populate('batch');
    } catch (error) {
        throw new Error('Không thể tìm thấy thông tin kho.');
    }
};

const addInventory = async (inventoryData) => {
    try {
        if (!inventoryData.product || !inventoryData.batch || !inventoryData.quantity) {
            throw new Error('Thiếu thông tin bắt buộc.');
        }
        
        const inventory = new Inventory(inventoryData);
        return await inventory.save();
    } catch (error) {
        throw new Error(error.message || 'Không thể thêm vào kho.');
    }
};

const updateInventory = async (id, inventoryData) => {
    try {
        if (!inventoryData.product || !inventoryData.batch || !inventoryData.quantity) {
            throw new Error('Thiếu thông tin bắt buộc.');
        }
        
        return await Inventory.findByIdAndUpdate(id, inventoryData, { new: true })
            .populate('product')
            .populate('batch');
    } catch (error) {
        throw new Error('Không thể cập nhật thông tin kho.');
    }
};

const deleteInventory = async (id) => {
    try {
        return await Inventory.findByIdAndDelete(id);
    } catch (error) {
        throw new Error('Không thể xóa thông tin kho.');
    }
};

const getInventoriesPaginated = async (page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    try {
        const inventories = await Inventory.find()
            .skip(skip)
            .limit(limit)
            .populate('product')
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
    updateInventory,
    deleteInventory,
    getInventoriesPaginated
};