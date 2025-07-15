import { Request, Response } from 'express';
import knex from '../../config/db';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest, IUser } from '../../types';

interface IAuthBody {
  username?: string;
  email?: string;
  password?: string;
}

export const register = async (req: Request<{}, {}, IAuthBody>, res: Response) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Tüm alanlar gereklidir.' });
    }
    const existingUser = await knex('users')
      .where({ email: email })
      .orWhere({ username: username })
      .first<IUser>();
    if (existingUser) {
      return res.status(409).json({ message: 'Bu kullanıcı adı veya e-posta zaten mevcut.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: uuidv4(),
      username: username,
      email: email,
      password_hash: hashedPassword,
    };
    await knex('users').insert(newUser);
    const userRole = await knex('roles').where({ name: 'user' }).first();
    if (userRole) {
      await knex('user_roles').insert({
        user_id: newUser.id,
        role_id: userRole.id
      });
    }
    res.status(201).json({ message: 'Kullanıcı başarıyla kaydedildi.', user: { username: newUser.username, email: newUser.email } });
  } catch (error) {
    console.error('Kayıt hatası:', error);
    res.status(500).json({ message: 'Kayıt işlemi sırasında bir hata oluştu.' });
  }
};

export const login = async (req: Request<{}, {}, IAuthBody>, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'E-posta ve şifre gereklidir.' });
    }
    const user = await knex('users').where({ email: email }).first<IUser>();
    if (!user) {
      return res.status(401).json({ message: 'E-posta veya şifre yanlış.' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'E-posta veya şifre yanlış.' });
    }
    const userRoles = await knex('user_roles')
      .join('roles', 'user_roles.role_id', 'roles.id')
      .where('user_roles.user_id', user.id)
      .select('roles.name');
    const roles = userRoles.map(role => role.name);
    const jwtSecret = process.env.JWT_SECRET as string;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is not defined.');
    }
    const token = jwt.sign(
      { id: user.id, username: user.username, roles: roles },
      jwtSecret,
      { expiresIn: '1h' }
    );
    res.status(200).json({
      message: 'Giriş başarılı.',
      token: token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        roles: roles
      }
    });
  } catch (error) {
    console.error('Giriş hatası:', error);
    res.status(500).json({ message: 'Giriş işlemi sırasında bir hata oluştu.' });
  }
};

export const me = (req: AuthenticatedRequest, res: Response) => {
  res.status(200).json(req.user);
};