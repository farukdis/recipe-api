const express = require('express');
const router = express.Router();

const userRoutes = require('./user');
const recipeRoutes = require('./recipe/recipe.routes');
const commentRoutes = require('./comment/comment.routes');
const favoritesRoutes = require('./favorites/favorites.routes'); // Yeni eklenen satır


// Kullanıcı rotalarını /api/users yolunda bağla
router.use('/users', userRoutes);

// Yemek tarifi rotalarını /api/recipes yolunda bağla
router.use('/recipes', recipeRoutes);

// Yorum rotalarını /api/comments yolunda bağla
router.use('/comments', commentRoutes);

// Favori rotalarını /api/favorites yolunda bağla
router.use('/favorites', favoritesRoutes); // Yeni eklenen satır


module.exports = router;