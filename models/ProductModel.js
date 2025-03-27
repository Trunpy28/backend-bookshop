import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    productCode: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    images: { 
        type: [String],
        required: true 
    },
    genre: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Genre',
        required: true
    },
    countInStock: {
        type: Number,
        default: 0
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
        type: Number,
        required: true
    },
    weight: {
        type: String
    },
    dimensions: {
        type: String
    },
    pageCount: {
        type: Number,
        required: true
    },
    format: {
        type: String
    },
    description: {
        type: String, // Rich text lưu trữ dưới dạng HTML hoặc Markdown
        required: true
    },
    rating: {
        avgRating: { type: Number, default: 0 },
        totalReviews: { type: Number, default: 0 }
    }
}, {
    timestamps: true
});

const Product = mongoose.model('Product', productSchema);
export default Product;