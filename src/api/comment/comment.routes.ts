import express, { Router, Request, Response, NextFunction } from 'express';
import * as commentController from './comment.controller';
import authenticateToken from '../../middleware/auth';
import { AuthenticatedRequest } from '../../types';
import { z } from 'zod';

const router: Router = express.Router();

// Zod şemalarını kullanarak doğrulama yapan jenerik middleware
const validate = (schema: z.ZodObject<any, any>) => (req: Request, res: Response, next: NextFunction) => {
  try {
    schema.parse({ ...req.body, ...req.params });
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.issues.map(issue => ({ path: issue.path, message: issue.message })) });
    }
    next(error);
  }
};

// Yorum için şemalar
const getCommentsSchema = z.object({
  recipe_id: z.uuid({ message: 'Geçersiz tarif ID formatı.' }),
});

const createCommentSchema = z.object({
  recipe_id: z.uuid({ message: 'Geçersiz tarif ID formatı.' }),
  comment_text: z.string().min(1, { message: 'Yorum metni boş olamaz.' }).max(500, { message: 'Yorum metni en fazla 500 karakter olabilir.' }),
});

const updateCommentSchema = z.object({
  id: z.uuid({ message: 'Geçersiz yorum ID formatı.' }),
  comment_text: z.string().min(1, { message: 'Yorum metni boş olamaz.' }).max(500, { message: 'Yorum metni en fazla 500 karakter olabilir.' }),
});

const deleteCommentSchema = z.object({
  id: z.uuid({ message: 'Geçersiz yorum ID formatı.' }),
});

// Yorum rotaları
router.get('/:recipe_id', validate(getCommentsSchema), commentController.getCommentsByRecipeId);

router.post(
  '/:recipe_id',
  authenticateToken,
  validate(createCommentSchema),
  (req, res) => commentController.createComment(req as AuthenticatedRequest, res)
);

router.put(
  '/:id',
  authenticateToken,
  validate(updateCommentSchema),
  (req, res) => commentController.updateComment(req as AuthenticatedRequest, res)
);

router.delete(
  '/:id',
  authenticateToken,
  validate(deleteCommentSchema),
  (req, res) => commentController.deleteComment(req as AuthenticatedRequest, res)
);

export default router;