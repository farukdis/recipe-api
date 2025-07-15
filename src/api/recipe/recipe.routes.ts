import express, { Router, Request, Response, NextFunction } from 'express';
import * as recipeController from './recipe.controller';
import authenticateToken from '../../middleware/auth';
import { AuthenticatedRequest } from '../../types';

const router: Router = express.Router();

router.get('/', recipeController.getAllRecipes);
router.get('/:id/details', recipeController.getRecipeDetails);
router.get('/:id', recipeController.getRecipeById);

router.post('/', authenticateToken, (req, res) => recipeController.createRecipe(req as AuthenticatedRequest, res));
router.put('/:id', authenticateToken, (req, res) => recipeController.updateRecipe(req as AuthenticatedRequest, res));
router.delete('/:id', authenticateToken, (req, res) => recipeController.deleteRecipe(req as AuthenticatedRequest, res));

export default router;