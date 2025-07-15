const express = require('express');
const recipeController = require('./recipe.controller');
const authenticateToken = require('../../middleware/auth');

const router = express.Router();

// Tarif rotalarını burada tanımlayacağız
router.get('/', recipeController.getAllRecipes);
router.get('/:id', recipeController.getRecipeById);

router.post('/', authenticateToken, recipeController.createRecipe);
router.put('/:id', authenticateToken, recipeController.updateRecipe);
router.delete('/:id', authenticateToken, recipeController.deleteRecipe);

module.exports = router;