import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            default: '',
            select: false
        },
        isAdmin: {
            type: Boolean,
            default: false,
            required: true
        },
        phone: {
            type: String,
            match: /^\d+$/
        },
        address: {
            city: {
                type: String,
                default: ''
            },
            district: {
                type: String,
                default: ''
            },
            ward: {
                type: String,
                default: ''
            },
            detailedAddress: {
                type: String,
                default: ''
            }
        },
        avatar: {
            type: String,
        },
        resetPasswordToken: {
            type: String,
            select: false
        },
        resetPasswordExpiresIn: {
            type: Date,
            select: false
        }
    },
    {
        timestamps: true
    }
);

const User = mongoose.model('User', userSchema);
export default User;