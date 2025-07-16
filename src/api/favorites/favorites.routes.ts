import express, { Router, Request, Response, NextFunction } from 'express';
import * as favoritesController from './favorites.controller';
import authenticateToken from '../../middleware/auth';
import { AuthenticatedRequest } from '../../types';
import { z } from 'zod';

const router: Router = express.Router();

// Zod ile recipe_id için doğrulama şeması
const recipeIdSchema = z.object({
  recipe_id: z.uuid({ message: 'Geçersiz tarif ID formatı.' }),
});

// Zod şemasını kullanarak doğrulama yapan jenerik middleware
const validate = (schema: z.ZodObject<any, any>) => (req: Request, res: Response, next: NextFunction) => {
  try {
    schema.parse(req.params); // req.params'i doğruluyoruz
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.issues.map(issue => ({ path: issue.path, message: issue.message })) });
    }
    next(error);
  }
};

// Favorilere tarif ekleme
router.post(
  '/:recipe_id',
  authenticateToken,
  validate(recipeIdSchema), // Validasyon middleware'ini ekledik
  (req, res) => favoritesController.addFavorite(req as AuthenticatedRequest, res)
);

// Favorilerden tarif kaldırma
router.delete(
  '/:recipe_id',
  authenticateToken,
  validate(recipeIdSchema), // Validasyon middleware'ini ekledik
  (req, res) => favoritesController.removeFavorite(req as AuthenticatedRequest, res)
);

// Kullanıcının tüm favorilerini getirme
router.get('/', authenticateToken, (req, res) =>
  favoritesController.getFavorites(req as AuthenticatedRequest, res)
);

export default router;