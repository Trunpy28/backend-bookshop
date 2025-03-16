import mongoose from 'mongoose';

const genreSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

const Genre = mongoose.model('Genre', genreSchema);
export default Genre; 