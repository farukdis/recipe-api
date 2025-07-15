import express, { Router, Request, Response, NextFunction } from 'express';
import * as favoritesController from './favorites.controller';
import authenticateToken from '../../middleware/auth';
import { AuthenticatedRequest } from '../../types';

const router: Router = express.Router();

// Favorilere tarif ekleme
router.post('/:recipe_id', authenticateToken, (req, res) =>
  favoritesController.addFavorite(req as AuthenticatedRequest, res)
);

// Favorilerden tarif kaldırma
router.delete('/:recipe_id', authenticateToken, (req, res) =>
  favoritesController.removeFavorite(req as AuthenticatedRequest, res)
);

// Kullanıcının tüm favorilerini getirme
router.get('/', authenticateToken, (req, res) =>
  favoritesController.getFavorites(req as AuthenticatedRequest, res)
);

export default router;