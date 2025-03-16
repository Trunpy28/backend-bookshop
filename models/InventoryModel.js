import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    batch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Batch',
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    costPrice: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

const Inventory = mongoose.model('Inventory', inventorySchema);
export default Inventory; 