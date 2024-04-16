const mongoose = require('mongoose');
const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true
        },
        img: { 
            type: String, 
            required: true 
        },
        type: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        countInStock: {
            type: Number,
            required: true
        },
        rating: {
            type: Number,
            required: true
        },
        description: {
            type: String
        },
        author: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
);

const Product = mongoose.model('Product', productSchema);
module.exports = Product;