// controllers/GenreController.js
import GenreService from '../services/GenreService.js';

const getAllGenres = async (req, res) => {
  try {
    const genres = await GenreService.getAllGenres();
    res.status(200).json({ message: 'Lấy danh sách thể loại thành công', data: genres });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách thể loại', error: error.message });
  }
};

const getGenreById = async (req, res) => {
  try {
    const genre = await GenreService.getGenreById(req.params.id);
    res.status(200).json({ message: 'Lấy thể loại thành công', data: genre });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy thể loại', error: error.message });
  }
};

const createGenre = async (req, res) => {
  try {
    const genre = await GenreService.createGenre(req.body);
    res.status(201).json({ message: 'Tạo thể loại thành công', data: genre });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi tạo thể loại', error: error.message });
  }
};

const updateGenre = async (req, res) => {
  try {
    const updatedGenre = await GenreService.updateGenre(req.params.id, req.body);
    res.status(200).json({ message: 'Cập nhật thể loại thành công', data: updatedGenre });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi cập nhật thể loại', error: error.message });
  }
};

const deleteGenre = async (req, res) => {
  try {
    await GenreService.deleteGenre(req.params.id);
    res.status(200).json({ message: 'Xóa thể loại thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa thể loại', error: error.message });
  }
};

export default {
  getAllGenres,
  getGenreById,
  createGenre,
  updateGenre,
  deleteGenre
};