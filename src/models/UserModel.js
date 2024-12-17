const mongoose = require('mongoose');
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
            //required: true,
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
            type: String,
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
module.exports = User;