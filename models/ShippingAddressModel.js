import mongoose from 'mongoose';

const shippingAddressSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        addresses: [
            {
                fullName: {
                    type: String,
                    required: true
                },
                phone: {
                    type: String,
                    required: true,
                    match: /^\d+$/
                },
                city: {
                    type: String,
                    required: true
                },
                district: {
                    type: String,
                    required: true
                },
                ward: {
                    type: String,
                    required: true
                },
                detailedAddress: {
                    type: String,
                    required: true
                },
                addressType: {
                    type: String,
                    enum: ['home', 'office'],
                    default: 'home',
                    required: true
                },
                isDefault: {
                    type: Boolean,
                    default: false
                }
            }
        ]
    },
    {
        timestamps: true
    }
);

const ShippingAddress = mongoose.model('ShippingAddress', shippingAddressSchema);
export default ShippingAddress; 