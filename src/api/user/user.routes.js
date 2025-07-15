const express = require('express');
const userController = require('./user.controller');
const authenticateToken = require('../../middleware/auth');

const router = express.Router();

// Public (Herkese Açık) Uç Noktalar
router.post('/register', userController.register);
router.post('/login', userController.login);

// Korumalı (Giriş Yapmış Kullanıcı) Uç Noktalar
router.get('/me', authenticateToken, userController.me);

module.exports = router;