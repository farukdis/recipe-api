const knex = require("../../config/db");
const { v4: uuidv4 } = require('uuid');

exports.getAllRecipes = async (req, res) => {
  try {
    const recipes = await knex("recipes").select("*");
    res.status(200).json({
      message: "Tarifler başarıyla getirildi.",
      recipes,
    });
  } catch (error) {
    console.error("Tüm tarifleri getirme hatası:", error);
    res
      .status(500)
      .json({ message: "Tüm tarifleri getirme sırasında bir hata oluştu." });
  }
};

exports.getRecipeById = async (req, res) => {
  try {
    const { id } = req.params;
    const recipe = await knex("recipes").where({ id: id }).first();

    if (!recipe) {
      return res.status(404).json({ message: "Tarif bulunamadı." });
    }

    res.status(200).json({
      message: "Tarif başarıyla getirildi.",
      recipe,
    });
  } catch (error) {
    console.error("Tarif getirme hatası", error);
    res.status(500).json({
      message: "Tarifi getirme sırasında bir hata oluştu.",
    });
  }
};

exports.createRecipe = async (req, res) => {
  try {
    const { title, description, image_url, prep_time, cook_time, servings } = req.body;
    const userId = req.user.id;

    if (!title || !userId) {
      return res.status(400).json({ message: "Başlık ve kullanıcı bilgisi gereklidir." });
    }

    const newRecipe = {
      id: uuidv4(),
      title,
      description,
      image_url,
      prep_time,
      cook_time,
      servings,
      user_id: userId,
    };

    await knex('recipes').insert(newRecipe);

    res.status(201).json({ message: 'Tarif başarıyla oluşturuldu.', recipeId: newRecipe.id });
  } catch (error) {
    console.error('Tarif oluşturma hatası:', error);
    res.status(500).json({ message: 'Tarif oluşturma sırasında bir hata oluştu.' });
  }
};

exports.updateRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, image_url, prep_time, cook_time, servings } = req.body;
    const userId = req.user.id;

    // 1. Tarife ulaş ve kullanıcı kimliğini doğrula
    const recipe = await knex('recipes').where({ id }).first();

    if (!recipe) {
      return res.status(404).json({ message: 'Tarif bulunamadı.' });
    }

    if (recipe.user_id !== userId) {
      return res.status(403).json({ message: 'Bu tarifi güncelleme yetkiniz yok.' });
    }

    // 2. Güncellenecek verileri hazırla
    const updatedFields = {
      title,
      description,
      image_url,
      prep_time,
      cook_time,
      servings,
      updated_at: knex.fn.now() // Güncelleme zamanını otomatik ayarla
    };

    // 3. Veritabanını güncelle
    await knex('recipes').where({ id }).update(updatedFields);

    res.status(200).json({ message: 'Tarif başarıyla güncellendi.' });

  } catch (error) {
    console.error('Tarif güncelleme hatası:', error);
    res.status(500).json({ message: 'Tarif güncelleme sırasında bir hata oluştu.' });
  }
};