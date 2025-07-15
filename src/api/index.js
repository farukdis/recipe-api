const express = require('express');
const router = express.Router();

const userRoutes = require('./user');
const recipeRoutes = require('./recipe/recipe.routes');
const commentRoutes = require('./comment/comment.routes'); // Yeni eklenen satır


// Kullanıcı rotalarını /api/users yolunda bağla
router.use('/users', userRoutes);

// Yemek tarifi rotalarını /api/recipes yolunda bağla
router.use('/recipes', recipeRoutes);

// Yorum rotalarını /api/comments yolunda bağla
router.use('/comments', commentRoutes); // Yeni eklenen satır


module.exports = router;