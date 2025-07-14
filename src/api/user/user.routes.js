const express = require('express');
const userController = require('./user.controller');

const router = express.Router();

// Public (Herkese Açık) Uç Noktalar
router.get('/', userController.me);
router.post('/register', userController.register);
router.post('/login', userController.login);

module.exports = router;