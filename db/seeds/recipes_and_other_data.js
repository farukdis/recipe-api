const { v4: uuidv4 } = require('uuid');
const { faker } = require('@faker-js/faker');

exports.seed = async function(knex) {
  // Var olan verileri temizle
  await knex('favorites').del();
  await knex('comments').del();
  await knex('instructions').del();
  await knex('ingredients').del();
  await knex('recipes').del();

  // Test kullanıcılarını bul
  const adminUser = await knex('users').where({ username: 'adminuser' }).first();
  const testUser = await knex('users').where({ username: 'testuser' }).first();

  if (!adminUser || !testUser) {
    console.error("Admin veya test kullanıcısı bulunamadı. Lütfen ilk seed dosyasını çalıştırdığınızdan emin olun.");
    return;
  }

  // Örnek tarifler oluştur
  const recipe1Id = uuidv4();
  const recipe2Id = uuidv4();
  await knex('recipes').insert([
    {
      id: recipe1Id,
      title: 'Yaz Salatalı Makarna',
      description: faker.lorem.sentences(2),
      image_url: 'https://picsum.photos/800/600?random=1',
      prep_time: 15,
      cook_time: 20,
      servings: 4,
      user_id: adminUser.id
    },
    {
      id: recipe2Id,
      title: 'Baharatlı Tavuk Kanatları',
      description: faker.lorem.sentences(2),
      image_url: 'https://picsum.photos/800/600?random=2',
      prep_time: 10,
      cook_time: 30,
      servings: 2,
      user_id: testUser.id
    }
  ]);

  // Örnek malzemeler oluştur
  await knex('ingredients').insert([
    { id: uuidv4(), name: 'Makarna', quantity: '250g', recipe_id: recipe1Id },
    { id: uuidv4(), name: 'Domates', quantity: '2 adet', recipe_id: recipe1Id },
    { id: uuidv4(), name: 'Tavuk kanatları', quantity: '500g', recipe_id: recipe2Id },
    { id: uuidv4(), name: 'Acı sos', quantity: '2 yemek kaşığı', recipe_id: recipe2Id }
  ]);

  // Örnek talimatlar oluştur
  await knex('instructions').insert([
    { id: uuidv4(), step_number: 1, step_text: 'Makarnayı haşlayın.', recipe_id: recipe1Id },
    { id: uuidv4(), step_number: 2, step_text: 'Tüm malzemeleri karıştırın.', recipe_id: recipe1Id },
    { id: uuidv4(), step_number: 1, step_text: 'Tavukları baharatlayın.', recipe_id: recipe2Id },
    { id: uuidv4(), step_number: 2, step_text: 'Fırında pişirin.', recipe_id: recipe2Id }
  ]);

  // Örnek yorumlar oluştur
  await knex('comments').insert([
    { id: uuidv4(), comment_text: 'Çok lezzetli bir tarif!', user_id: testUser.id, recipe_id: recipe1Id }
  ]);

  // Örnek favoriler oluştur
  await knex('favorites').insert([
    { user_id: testUser.id, recipe_id: recipe1Id }
  ]);
};