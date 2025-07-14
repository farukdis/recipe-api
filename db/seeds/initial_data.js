const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

exports.seed = async function(knex) {
  // Var olan verileri sil
  await knex('user_roles').del();
  await knex('roles').del();
  await knex('users').del();

  // Varsayılan rolleri ekle
  const adminRoleId = uuidv4();
  const userRoleId = uuidv4();
  await knex('roles').insert([
    { id: adminRoleId, name: 'admin', description: 'Administrator role with full access.' },
    { id: userRoleId, name: 'user', description: 'Standard user role with basic access.' }
  ]);

  // Test kullanıcılarını ekle
  const hashedPassword1 = await bcrypt.hash('password123', 10);
  const user1Id = uuidv4();
  const hashedPassword2 = await bcrypt.hash('password456', 10);
  const user2Id = uuidv4();
  await knex('users').insert([
    {
      id: user1Id,
      username: 'adminuser',
      email: 'admin@example.com',
      password_hash: hashedPassword1
    },
    {
      id: user2Id,
      username: 'testuser',
      email: 'test@example.com',
      password_hash: hashedPassword2
    }
  ]);

  // Kullanıcı ve rol ilişkilerini ekle
  await knex('user_roles').insert([
    { user_id: user1Id, role_id: adminRoleId },
    { user_id: user2Id, role_id: userRoleId }
  ]);
};