import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true 
        },
        orderItems: [
            {
                productCode: {
                    type: String,
                    required: true,
                },
                name: {
                    type: String,
                    required: true,
                },
                images: { 
                    type: [String],
                    required: true 
                },
                originalPrice: {
                    type: Number,
                    required: true
                },
                quantity: {
                    type: Number,
                    required: true
                },
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true
                }
            }
        ],
        fullName: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        itemsPrice: {
            type: Number,
            required: true
        },
        shippingPrice: {
            type: Number,
            required: true
        },
        discountPrice: {
            type: Number,
            required: true,
            default: 0
        },
        totalPrice: {
            type: Number,
            required: true
        },
        voucherCode: {
            type: String,
            required: false
        },
        status: {
            type: String,
            enum: ['Pending', 'Shipping', 'Delivered', 'Cancelled'],
            default: 'Pending'
        },
        deliveryAt: {
            type: Date
        },
        deliveredAt: {
            type: Date
        },
        cancelledAt: {
            type: Date
        },
        cancelReason: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

const Order = mongoose.model('Order', orderSchema);
export default Order;