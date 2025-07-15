const express = require('express');
const router = express.Router();
const favoritesController = require('./favorites.controller');
const authenticateToken = require('../../middleware/auth');

// Favorilere tarif ekleme
router.post('/:recipe_id', authenticateToken, favoritesController.addFavorite);

// Favorilerden tarif kaldırma
router.delete('/:recipe_id', authenticateToken, favoritesController.removeFavorite);

// Kullanıcının tüm favorilerini getirme
router.get('/', authenticateToken, favoritesController.getFavorites); // Yeni eklenen satır

module.exports = router;