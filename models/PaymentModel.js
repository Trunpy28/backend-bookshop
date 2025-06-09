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


// Chỉ mục tổng hợp cho status và paidAt để tối ưu các truy vấn thống kê doanh thu
paymentSchema.index({ status: 1, paidAt: 1 });

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment; 