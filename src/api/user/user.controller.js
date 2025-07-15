const knex = require('../../config/db');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 1. Gelen verinin geçerliliğini kontrol et
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Tüm alanlar gereklidir.' });
    }

    // 2. Kullanıcının zaten var olup olmadığını kontrol et
    const existingUser = await knex('users')
      .where({ email: email })
      .orWhere({ username: username })
      .first();

    if (existingUser) {
      return res.status(409).json({ message: 'Bu kullanıcı adı veya e-posta zaten mevcut.' });
    }

    // 3. Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Yeni kullanıcıyı veritabanına kaydet
    const newUser = {
      id: uuidv4(),
      username: username,
      email: email,
      password_hash: hashedPassword,
    };
    await knex('users').insert(newUser);

    // 5. Varsayılan "user" rolünü ata
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

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Gelen verinin geçerliliğini kontrol et
    if (!email || !password) {
      return res.status(400).json({ message: 'E-posta ve şifre gereklidir.' });
    }

    // 2. Kullanıcıyı e-posta ile bul
    const user = await knex('users').where({ email: email }).first();
    if (!user) {
      return res.status(401).json({ message: 'E-posta veya şifre yanlış.' });
    }

    // 3. Şifreyi karşılaştır
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'E-posta veya şifre yanlış.' });
    }

    // 4. Kullanıcıya ait rolleri bul
    const userRoles = await knex('user_roles')
      .join('roles', 'user_roles.role_id', 'roles.id')
      .where('user_roles.user_id', user.id)
      .select('roles.name');
    const roles = userRoles.map(role => role.name);

    // 5. JWT oluştur
    const token = jwt.sign(
      { id: user.id, username: user.username, roles: roles },
      process.env.JWT_SECRET,
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

exports.me = (req, res) => {
  res.status(200).json(req.user);
};