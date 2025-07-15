const express = require('express');
const recipeController = require('./recipe.controller');

const router = express.Router();

// Tarif rotalarını burada tanımlayacağız
router.get('/', recipeController.getAllRecipes);
router.get('/:id', recipeController.getRecipeById);

module.exports = router;