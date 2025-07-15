import { Request, Response, NextFunction } from 'express';
import jwt, { Secret, JwtPayload } from 'jsonwebtoken';
import { AuthenticatedRequest } from '../types';

interface IJwtUserPayload {
  id: number;
  username: string;
  email: string;
  roles: string[];
}

const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    return res.status(401).json({ message: 'Token gerekli.' });
  }

  jwt.verify(token, process.env.JWT_SECRET as Secret, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Geçersiz token.' });
    }
    // TypeScript'e req.user'ın artık bu tipe sahip olduğunu belirtiyoruz
    (req as AuthenticatedRequest).user = user as IJwtUserPayload;
    next();
  });
};

export default authenticateToken;