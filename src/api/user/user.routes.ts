import express, { Router, Request, Response, NextFunction } from 'express';
import * as userController from './user.controller';
import authenticateToken from '../../middleware/auth';
import { AuthenticatedRequest } from '../../types';

const router: Router = express.Router();

// Herkese Açık (Public) Uç Noktalar
router.post('/register', userController.register);
router.post('/login', userController.login);

// Korumalı (Giriş Yapmış Kullanıcı) Uç Noktalar
router.get('/me', authenticateToken, (req, res) => {
  const typedReq = req as AuthenticatedRequest;
  userController.me(typedReq, res);
});

export default router;