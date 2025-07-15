const express = require('express');
const commentController = require('./comment.controller');
const authenticateToken = require('../../middleware/auth'); 
const router = express.Router();

// Yorum rotaları buraya gelecek
router.get('/:recipe_id', commentController.getCommentsByRecipeId);

router.post('/:recipe_id', authenticateToken, commentController.createComment); 

module.exports = router;