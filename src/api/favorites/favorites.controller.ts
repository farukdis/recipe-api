import { Request, Response } from 'express';
import knex from '../../config/db';
import { AuthenticatedRequest, IRecipe, IFavorite, IFavoriteRecipe } from '../../types';

export const addFavorite = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { recipe_id } = req.params;
    const userId = req.user.id;

    const favoriteExists = await knex('favorites')
      .where({ user_id: userId, recipe_id })
      .first<IFavorite>();

    if (favoriteExists) {
      return res.status(409).json({ message: "Bu tarif zaten favorilerinizde." });
    }

    const newFavorite: IFavorite = {
      user_id: userId,
      recipe_id,
      created_at: new Date()
    };

    await knex('favorites').insert(newFavorite);
    res.status(201).json({ message: "Tarif favorilere başarıyla eklendi." });
  } catch (error) {
    console.error("Favori ekleme hatası:", error);
    res.status(500).json({ message: "Favori ekleme sırasında bir hata oluştu." });
  }
};

export const removeFavorite = async (req: AuthenticatedRequest, res: Response) => {
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

export const getFavorites = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user.id;

    const favorites = await knex('favorites')
      .leftJoin('recipes', 'favorites.recipe_id', 'recipes.id')
      .leftJoin('users', 'recipes.user_id', 'users.id')
      .where('favorites.user_id', userId)
      .select('recipes.*', 'users.username as author_username')
      .orderBy('favorites.created_at', 'desc')
      .distinct('recipes.id') as IFavoriteRecipe[];

    res.status(200).json({ favorites });
  } catch (error) {
    console.error("Favorileri getirme hatası:", error);
    res.status(500).json({ message: "Favorileri getirme sırasında bir hata oluştu." });
  }
};