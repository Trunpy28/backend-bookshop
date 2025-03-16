import express from 'express';
import GenreController from '../controllers/GenreController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/get-all', GenreController.getAllGenres);
router.post('/create', authMiddleware, GenreController.createGenre);
router.put('/update/:id', authMiddleware, GenreController.updateGenre);
router.delete('/delete/:id', authMiddleware, GenreController.deleteGenre);

export default router; 