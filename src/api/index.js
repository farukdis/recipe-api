const express = require('express');
const router = express.Router();

const userRoutes = require('./user');

// Kullanıcı rotalarını /api/users yolunda bağla
router.use('/users', userRoutes);

module.exports = router;