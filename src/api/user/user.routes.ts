import express, { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as userController from './user.controller';
import authenticateToken from '../../middleware/auth';
import { AuthenticatedRequest } from '../../types';

const router: Router = express.Router();

// Zod ile kayıt için doğrulama şeması
const registerSchema = z.object({
  username: z.string().min(3, { message: 'Kullanıcı adı en az 3 karakter olmalıdır.' }),
  email: z.email({ message: 'Geçerli bir e-posta adresi girin.' }), 
  password: z.string().min(6, { message: 'Şifre en az 6 karakter olmalıdır.' })
});

// Zod ile giriş için doğrulama şeması
const loginSchema = z.object({
  email: z.email({ message: 'Geçerli bir e-posta adresi girin.' }), 
  password: z.string().min(6, { message: 'Şifre en az 6 karakter olmalıdır.' })
});

// Zod şemalarını kullanarak doğrulama yapan jenerik middleware
const validate = (schema: z.ZodObject<any, any>) => (req: Request, res: Response, next: NextFunction) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.issues.map(issue => ({ path: issue.path, message: issue.message })) });
    }
    next(error);
  }
};

// Herkese Açık (Public) Uç Noktalar
router.post('/register', validate(registerSchema), userController.register);
router.post('/login', validate(loginSchema), userController.login);

// Korumalı (Giriş Yapmış Kullanıcı) Uç Noktalar
router.get('/me', authenticateToken, (req, res) => {
  const typedReq = req as AuthenticatedRequest;
  userController.me(typedReq, res);
});

export default router;