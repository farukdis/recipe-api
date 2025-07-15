import express, { Router } from 'express';

// Bu dosyalar henüz dönüştürülmedi, hata alacağız.
import userRoutes from './user';
import recipeRoutes from './recipe/recipe.routes';
import commentRoutes from './comment/comment.routes';
import favoritesRoutes from './favorites/favorites.routes';

const router: Router = express.Router();

router.use('/users', userRoutes);
router.use('/recipes', recipeRoutes);
router.use('/comments', commentRoutes);
router.use('/favorites', favoritesRoutes);

export default router;