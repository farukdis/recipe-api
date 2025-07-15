const express = require('express');
const router = express.Router();

const userRoutes = require('./user');
const recipeRoutes = require('./recipe/recipe.routes');


// Kullanıcı rotalarını /api/users yolunda bağla
router.use('/users', userRoutes);

// Yemek tarifi rotalarını /api/recipes yolunda bağla
router.use('/recipes', recipeRoutes);



module.exports = router;