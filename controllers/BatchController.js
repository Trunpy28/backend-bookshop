import BatchService from '../services/BatchService.js';

const getAllBatches = async (req, res) => {
  try {
    const batches = await BatchService.getAllBatches();
    res.status(200).json(batches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBatchById = async (req, res) => {
  try {
    const { id } = req.params;
    const batch = await BatchService.getBatchById(id);
    if (!batch) {
      return res.status(404).json({ message: 'Không tìm thấy lô hàng' });
    }
    res.status(200).json(batch);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createBatch = async (req, res) => {
  try {
    const batchData = req.body;
    const newBatch = await BatchService.createBatch(batchData);
    res.status(201).json(newBatch);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateBatch = async (req, res) => {
  try {
    const { id } = req.params;
    const batchData = req.body;
    const updatedBatch = await BatchService.updateBatch(id, batchData);
    if (!updatedBatch) {
      return res.status(404).json({ message: 'Không tìm thấy lô hàng' });
    }
    res.status(200).json(updatedBatch);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteBatch = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await BatchService.deleteBatch(id);
    if (!result) {
      return res.status(404).json({ message: 'Không tìm thấy lô hàng' });
    }
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBatchesPaginated = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      supplierName,
      batchId,
      startDate,
      endDate
    } = req.query;
    
    const filters = {
      supplierName,
      batchId,
      startDate,
      endDate
    };
    
    const { batches, total } = await BatchService.getBatchesPaginated(
      Number(page), 
      Number(limit),
      filters
    );
    
    res.status(200).json({ batches, total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addItemToBatch = async (req, res) => {
  try {
    const { batchId } = req.params;
    const itemData = req.body;
    const batch = await BatchService.addItemToBatch(batchId, itemData);
    res.status(200).json(batch);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const removeItemFromBatch = async (req, res) => {
  try {
    const { batchId, itemId } = req.params;
    const batch = await BatchService.removeItemFromBatch(batchId, itemId);
    res.status(200).json(batch);
  } catch (error) {
    res.status(400).json({ message: error.message });
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