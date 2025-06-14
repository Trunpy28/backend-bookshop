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
        quantity: {
            type: Number,
            required: true,
            min: 1
        }
    }],
    discountPercentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    notes: {
        type: String
    }
}, {
    timestamps: true
});

const Batch = mongoose.model('Batch', batchSchema);
export default Batch; 