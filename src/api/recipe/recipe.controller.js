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

exports.deleteRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // 1. Tarife ulaş ve kullanıcı kimliğini doğrula
    const recipe = await knex('recipes').where({ id }).first();

    if (!recipe) {
      return res.status(404).json({ message: 'Tarif bulunamadı.' });
    }

    if (recipe.user_id !== userId) {
      return res.status(403).json({ message: 'Bu tarifi silme yetkiniz yok.' });
    }

    // 2. Tarife ait tüm ilişkili verileri sil
    await knex('ingredients').where({ recipe_id: id }).del();
    await knex('instructions').where({ recipe_id: id }).del();
    await knex('comments').where({ recipe_id: id }).del();
    await knex('favorites').where({ recipe_id: id }).del();

    // 3. Tarife ait veritabanı kaydını sil
    await knex('recipes').where({ id }).del();

    res.status(200).json({ message: 'Tarif başarıyla silindi.' });

  } catch (error) {
    console.error('Tarif silme hatası:', error);
    res.status(500).json({ message: 'Tarif silme sırasında bir hata oluştu.' });
  }
};

exports.getRecipeDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // Tüm veriyi JOIN ile çek
    const rawData = await knex('recipes')
      .leftJoin('ingredients', 'recipes.id', 'ingredients.recipe_id')
      .leftJoin('instructions', 'recipes.id', 'instructions.recipe_id')
      .leftJoin('users', 'recipes.user_id', 'users.id')
      .where('recipes.id', id)
      .select(
        'recipes.id as recipe_id',
        'recipes.title',
        'recipes.description',
        'recipes.image_url',
        'recipes.prep_time',
        'recipes.cook_time',
        'recipes.servings',
        'recipes.created_at',
        'recipes.updated_at',
        'users.username',
        'ingredients.id as ingredient_id',
        'ingredients.name as ingredient_name',
        'ingredients.quantity',
        'instructions.id as instruction_id',
        'instructions.step_number',
        'instructions.step_text as instruction_description' 
      )
      .orderBy('instructions.step_number', 'asc');

    // Tarif bulunamadıysa 404 döndür
    if (!rawData || rawData.length === 0) {
      return res.status(404).json({ message: 'Tarif bulunamadı.' });
    }

    // Gelen veriyi okunabilir bir JSON yapısına dönüştür
    const recipe = {
      id: rawData[0].recipe_id,
      title: rawData[0].title,
      description: rawData[0].description,
      image_url: rawData[0].image_url,
      prep_time: rawData[0].prep_time,
      cook_time: rawData[0].cook_time,
      servings: rawData[0].servings,
      created_at: rawData[0].created_at,
      updated_at: rawData[0].updated_at,
      author: {
        username: rawData[0].username
      },
      ingredients: [],
      instructions: []
    };

    const ingredientIds = new Set();
    const instructionIds = new Set();

    rawData.forEach(row => {
      if (row.ingredient_id && !ingredientIds.has(row.ingredient_id)) {
        recipe.ingredients.push({
          id: row.ingredient_id,
          name: row.ingredient_name,
          quantity: row.quantity
        });
        ingredientIds.add(row.ingredient_id);
      }
      if (row.instruction_id && !instructionIds.has(row.instruction_id)) {
        recipe.instructions.push({
          id: row.instruction_id,
          step_number: row.step_number,
          description: row.instruction_description
        });
        instructionIds.add(row.instruction_id);
      }
    });

    res.status(200).json({
      message: 'Tarif detayları başarıyla getirildi.',
      recipe
    });

  } catch (error) {
    console.error('Tarif detaylarını getirme hatası:', error);
    res.status(500).json({ message: 'Tarif detaylarını getirme sırasında bir hata oluştu.' });
  }
};