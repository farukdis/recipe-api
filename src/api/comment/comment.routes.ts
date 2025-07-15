import express, { Router, Request, Response, NextFunction } from 'express';
import * as commentController from './comment.controller';
import authenticateToken from '../../middleware/auth';
import { AuthenticatedRequest } from '../../types';

const router: Router = express.Router();

// Yorum rotaları
router.get('/:recipe_id', commentController.getCommentsByRecipeId);

router.post('/:recipe_id', authenticateToken, (req, res) =>
  commentController.createComment(req as AuthenticatedRequest, res)
);

router.put('/:id', authenticateToken, (req, res) =>
  commentController.updateComment(req as AuthenticatedRequest, res)
);

router.delete('/:id', authenticateToken, (req, res) =>
  commentController.deleteComment(req as AuthenticatedRequest, res)
);

export default router;