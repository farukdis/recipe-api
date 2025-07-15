const express = require('express');
const commentController = require('./comment.controller');
const authenticateToken = require('../../middleware/auth'); 
const router = express.Router();

// Yorum rotaları
router.get('/:recipe_id', commentController.getCommentsByRecipeId);

router.post('/:recipe_id', authenticateToken, commentController.createComment); 

router.put('/:id', authenticateToken, commentController.updateComment);

router.delete('/:id', authenticateToken, commentController.deleteComment); // Yeni eklenen satır

module.exports = router;