import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    images: { 
        type: [String], // Mảng các đường dẫn hình ảnh từ Cloudinary
        required: true 
    },
    genre: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Genre',
        required: true
    },
    countInStock: {
        type: Number,
        required: true
    },
    originalPrice: {
        type: Number,
        required: true
    },
    selled: {
        type: Number,
        default: 0
    },
    author: {
        type: String,
        required: true
    },
    publisher: {
        type: String,
        required: true
    },
    publicationYear: {
        type: Number
    },
    weight: {
        type: String
    },
    dimensions: {
        type: String
    },
    pageCount: {
        type: Number
    },
    format: {
        type: String
    },
    description: {
        type: String, // Rich text lưu trữ dưới dạng HTML hoặc Markdown
        required: true
    }
}, {
    timestamps: true
});

const Product = mongoose.model('Product', productSchema);
export default Product;