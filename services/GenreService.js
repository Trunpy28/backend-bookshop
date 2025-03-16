import Genre from '../models/GenreModel.js';
import mongoose from 'mongoose';

const getAllGenres = async () => {
    try {
        return await Genre.find();
    } catch (error) {
        throw new Error('Không thể lấy danh sách thể loại.');
    }
};

const getGenreById = async (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('ID không hợp lệ.');
    }
    try {
        const genre = await Genre.findById(id);
        if (!genre) {
            throw new Error('Thể loại không tồn tại.');
        }
        return genre;
    } catch (error) {
        throw new Error('Không thể tìm thấy thể loại.');
    }
};

const createGenre = async (genreData) => {
    if (!genreData.name) {
        throw new Error('Tên thể loại là bắt buộc.');
    }
    if (!genreData.description) {
        throw new Error('Mô tả thể loại là bắt buộc.');
    }
    try {
        const existingGenre = await Genre.findOne({ name: genreData.name });
        if (existingGenre) {
            throw new Error('Thể loại với tên này đã tồn tại.');
        }
        
        const genre = new Genre(genreData);
        return await genre.save();
    } catch (error) {
        throw new Error(error.message || 'Không thể tạo thể loại mới.');
    }
};

const updateGenre = async (id, genreData) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('ID không hợp lệ.');
    }
    if (!genreData.name) {
        throw new Error('Tên thể loại là bắt buộc.');
    }
    if (!genreData.description) {
        throw new Error('Mô tả thể loại là bắt buộc.');
    }
    try {
        const existingGenre = await Genre.findOne({ name: genreData.name });
        if (existingGenre) {
            throw new Error('Thể loại với tên này đã tồn tại.');
        }
        
        const updatedGenre = await Genre.findByIdAndUpdate(id, genreData, { new: true });
        if (!updatedGenre) {
            throw new Error('Thể loại không tồn tại.');
        }
        return updatedGenre;
    } catch (error) {
        throw new Error(error.message || 'Không thể cập nhật thể loại.');
    }
};

const deleteGenre = async (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('ID không hợp lệ.');
    }
    try {
        const deletedGenre = await Genre.findByIdAndDelete(id);
        if (!deletedGenre) {
            throw new Error('Thể loại không tồn tại.');
        }
        return deletedGenre;
    } catch (error) {
        throw new Error('Không thể xóa thể loại.');
    }
};

export default {
    getAllGenres,
    getGenreById,
    createGenre,
    updateGenre,
    deleteGenre
};