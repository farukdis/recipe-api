const knex = require('../../config/db');

exports.getAllRecipes = async (req, res) => {
  try {
    const recipes = await knex('recipes').select('*');
    res.status(200).json({
      message: 'Tarifler başarıyla getirildi.',
      recipes
    });
  } catch (error) {
    console.error('Tüm tarifleri getirme hatası:', error);
    res.status(500).json({ message: 'Tüm tarifleri getirme sırasında bir hata oluştu.' });
  }
};