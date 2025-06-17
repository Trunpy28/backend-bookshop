import mongoose from 'mongoose';

const batchSchema = new mongoose.Schema({
    supplierName: {
        type: String,
        required: true
    },
    dateReceived: {
        type: Date,
        required: true
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        importPrice: {
            type: Number,
            required: true,
            min: 0
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        }
    }],
    notes: {
        type: String
    }
}, {
    timestamps: true
});

const Batch = mongoose.model('Batch', batchSchema);
export default Batch; 