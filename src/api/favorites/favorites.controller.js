const knex = require("../../config/db");

exports.addFavorite = async (req, res) => {
  try {
    const { recipe_id } = req.params;
    const userId = req.user.id;

    const favoriteExists = await knex('favorites')
      .where({ user_id: userId, recipe_id })
      .first();

    if (favoriteExists) {
      return res.status(409).json({ message: "Bu tarif zaten favorilerinizde." });
    }

    const newFavorite = {
      user_id: userId,
      recipe_id: recipe_id,
      created_at: knex.fn.now()
    };

    await knex('favorites').insert(newFavorite);
    res.status(201).json({ message: "Tarif favorilere başarıyla eklendi." });

  } catch (error) {
    console.error("Favori ekleme hatası:", error);
    res.status(500).json({ message: "Favori ekleme sırasında bir hata oluştu." });
  }
};

exports.removeFavorite = async (req, res) => {
  try {
    const { recipe_id } = req.params;
    const userId = req.user.id;

    const favoriteCount = await knex('favorites')
      .where({ user_id: userId, recipe_id })
      .del();

    if (favoriteCount === 0) {
      return res.status(404).json({ message: "Bu tarif favorilerinizde bulunamadı." });
    }

    res.status(200).json({ message: "Tarif favorilerden başarıyla kaldırıldı." });

  } catch (error) {
    console.error("Favori kaldırma hatası:", error);
    res.status(500).json({ message: "Favori kaldırma sırasında bir hata oluştu." });
  }
};

exports.getFavorites = async (req, res) => {
  try {
    const userId = req.user.id;

    const favorites = await knex('favorites')
      .leftJoin('recipes', 'favorites.recipe_id', 'recipes.id')
      .leftJoin('users', 'recipes.user_id', 'users.id')
      .where('favorites.user_id', userId)
      .select('recipes.*', 'users.username as author_username')
      .orderBy('favorites.created_at', 'desc');

    res.status(200).json({ favorites });

  } catch (error) {
    console.error("Favorileri getirme hatası:", error);
    res.status(500).json({ message: "Favorileri getirme sırasında bir hata oluştu." });
  }
};