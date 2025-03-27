import InventoryService from '../services/InventoryService.js';

const getInventoriesPaginated = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const { inventories, total } = await InventoryService.getInventoriesPaginated(Number(page), Number(limit));
    res.status(200).json({ inventories, total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllInventory = async (req, res) => {
  try {
    const inventories = await InventoryService.getAllInventory();
    res.status(200).json(inventories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getInventoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const inventory = await InventoryService.getInventoryById(id);
    res.status(200).json(inventory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addInventory = async (req, res) => {
  try {
    const inventoryData = req.body;
    const newInventory = await InventoryService.addInventory(inventoryData);
    res.status(201).json(newInventory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteInventory = async (req, res) => {
  try {
    const { id } = req.params;
    await InventoryService.deleteInventory(id);
    res.status(200).json({ message: 'Xóa kho hàng thành công' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default {
  getAllInventory,
  getInventoryById,
  addInventory,
  deleteInventory,
  getInventoriesPaginated,
}; 