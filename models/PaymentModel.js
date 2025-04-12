import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
    {
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order',
            required: true
        },
        amount: {
            type: Number,
            required: true
        },
        paymentMethod: {
            type: String,
            enum: ['COD', 'VNPAY', 'PAYPAL'],
            required: true
        },
        status: {
            type: String,
            enum: ['Pending', 'Completed', 'Failed'],
            default: 'Pending'
        },
        transactionId: {
            type: String
        },
        paidAt: {
            type: Date
        }
    },
    {
        timestamps: true
    }
);

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment; 