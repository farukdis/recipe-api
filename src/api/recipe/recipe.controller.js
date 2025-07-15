const knex = require("../../config/db");



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
