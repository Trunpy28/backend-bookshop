import express from 'express';
import GenreController from '../controllers/GenreController.js';
import { adminAuthMiddleware, authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/get-all', GenreController.getAllGenres);
router.post('/create', authMiddleware, adminAuthMiddleware, GenreController.createGenre);
router.put('/update/:id', authMiddleware, adminAuthMiddleware, GenreController.updateGenre);
router.delete('/delete/:id', authMiddleware, adminAuthMiddleware, GenreController.deleteGenre);
router.get('/detail/:id', authMiddleware, adminAuthMiddleware, GenreController.getGenreById);

export default router; 