import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true
        },
        image: { 
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
        },
        discount: {
            type: Number,
        },
        selled: {
            type: Number,
            default: 0,
        }
    },
    {
        timestamps: true
    }
);

const Product = mongoose.model('Product', productSchema);
export default Product;