import { Request, Response } from 'express';
import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';
import knex from '../../config/db';
import {
  AuthenticatedRequest,
  IRecipe,
  IRecipeDetails,
  IIngredient,
  IInstruction,
} from '../../types';

export const getAllRecipes = async (req: Request, res: Response) => {
  try {
    const recipes = await (knex as Knex)('recipes').select<IRecipe[]>('*');
    res.status(200).json({
      message: 'Tarifler başarıyla getirildi.',
      recipes,
    });
  } catch (error) {
    console.error('Tüm tarifleri getirme hatası:', error);
    res
      .status(500)
      .json({ message: 'Tüm tarifleri getirme sırasında bir hata oluştu.' });
  }
};

export const getRecipeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const recipe = await (knex as Knex)('recipes').where('id', id).first<IRecipe>();

    if (!recipe) {
      return res.status(404).json({ message: 'Tarif bulunamadı.' });
    }

    res.status(200).json({
      message: 'Tarif başarıyla getirildi.',
      recipe,
    });
  } catch (error) {
    console.error('Tarif getirme hatası', error);
    res.status(500).json({
      message: 'Tarifi getirme sırasında bir hata oluştu.',
    });
  }
};

export const createRecipe = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, description, image_url, prep_time, cook_time, servings } = req.body;
    const userId = req.user.id;

    if (!title || !userId) {
      return res.status(400).json({ message: 'Başlık ve kullanıcı bilgisi gereklidir.' });
    }

    const newRecipe: IRecipe = {
      id: uuidv4(),
      title,
      description,
      image_url,
      prep_time,
      cook_time,
      servings,
      user_id: userId,
      created_at: new Date(),
      updated_at: new Date(),
    };

    await (knex as Knex)<IRecipe>('recipes').insert(newRecipe);

    res.status(201).json({ message: 'Tarif başarıyla oluşturuldu.', recipeId: newRecipe.id });
  } catch (error) {
    console.error('Tarif oluşturma hatası:', error);
    res.status(500).json({ message: 'Tarif oluşturma sırasında bir hata oluştu.' });
  }
};

export const updateRecipe = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, image_url, prep_time, cook_time, servings } = req.body;
    const userId = req.user.id;

    const recipe = await (knex as Knex)('recipes').where('id', id).first<IRecipe>();

    if (!recipe) {
      return res.status(404).json({ message: 'Tarif bulunamadı.' });
    }

    if (recipe.user_id !== userId) {
      return res.status(403).json({ message: 'Bu tarifi güncelleme yetkiniz yok.' });
    }

    const updatedFields: Partial<IRecipe> = {
      title,
      description,
      image_url,
      prep_time,
      cook_time,
      servings,
      updated_at: new Date(),
    };

    await (knex as Knex)('recipes').where('id', id).update(updatedFields);

    res.status(200).json({ message: 'Tarif başarıyla güncellendi.' });
  } catch (error) {
    console.error('Tarif güncelleme hatası:', error);
    res.status(500).json({ message: 'Tarif güncelleme sırasında bir hata oluştu.' });
  }
};

export const deleteRecipe = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const recipe = await (knex as Knex)('recipes').where('id', id).first<IRecipe>();

    if (!recipe) {
      return res.status(404).json({ message: 'Tarif bulunamadı.' });
    }

    if (recipe.user_id !== userId) {
      return res.status(403).json({ message: 'Bu tarifi silme yetkiniz yok.' });
    }

    await (knex as Knex)('ingredients').where('recipe_id', id).del();
    await (knex as Knex)('instructions').where('recipe_id', id).del();
    await (knex as Knex)('comments').where('recipe_id', id).del();
    await (knex as Knex)('favorites').where('recipe_id', id).del();

    await (knex as Knex)('recipes').where('id', id).del();

    res.status(200).json({ message: 'Tarif başarıyla silindi.' });
  } catch (error) {
    console.error('Tarif silme hatası:', error);
    res.status(500).json({ message: 'Tarif silme sırasında bir hata oluştu.' });
  }
};

export const getRecipeDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const rawData = await (knex as Knex)<IRecipeDetails[]>('recipes')
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

    if (!rawData || rawData.length === 0) {
      return res.status(404).json({ message: 'Tarif bulunamadı.' });
    }

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
        username: rawData[0].username,
      },
      ingredients: [] as IIngredient[],
      instructions: [] as IInstruction[],
    };

    const ingredientIds = new Set();
    const instructionIds = new Set();

    rawData.forEach((row) => {
      if (row.ingredient_id && !ingredientIds.has(row.ingredient_id)) {
        recipe.ingredients.push({
          id: row.ingredient_id,
          name: row.ingredient_name || '',
          quantity: row.quantity || '',
          recipe_id: row.recipe_id,
        });
        ingredientIds.add(row.ingredient_id);
      }
      if (row.instruction_id && !instructionIds.has(row.instruction_id)) {
        recipe.instructions.push({
          id: row.instruction_id,
          step_number: row.step_number || 0,
          step_text: row.instruction_description || '',
          recipe_id: row.recipe_id,
        });
        instructionIds.add(row.instruction_id);
      }
    });

    res.status(200).json({
      message: 'Tarif detayları başarıyla getirildi.',
      recipe,
    });
  } catch (error) {
    console.error('Tarif detaylarını getirme hatası:', error);
    res.status(500).json({ message: 'Tarif detaylarını getirme sırasında bir hata oluştu.' });
  }
};