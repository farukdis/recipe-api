import { Request } from 'express';
import { Knex } from 'knex';

// Express tipini genişletmek için
declare module 'express-serve-static-core' {
  interface Request {
    user?: { id: number; email: string };
  }
}

// Kimlik doğrulaması yapılmış kullanıcı isteği için
export interface AuthenticatedRequest extends Request {
  user: { id: number; email: string };
}

// JWT Payload tipi
export interface IJwtUserPayload {
  id: number;
  email: string;
  roles: string[];
}

// Genel veritabanı tipi
export interface IRecipe {
  id: string;
  title: string;
  description: string;
  image_url: string;
  prep_time: string;
  cook_time: string;
  servings: number;
  user_id: number;
  created_at: Date;
  updated_at: Date;
}

// Yorum veritabanı tipi
export interface IComment {
  id: string;
  comment_text: string;
  user_id: number;
  recipe_id: string;
  created_at: Date;
  updated_at: Date | null;
}

// Favori veritabanı tipi
export interface IFavorite {
  user_id: number;
  recipe_id: string;
  created_at: Date;
}

// Favori ve tarif verilerinin birleşimi için bir arayüz
export interface IFavoriteRecipe extends IRecipe {
  author_username: string;
}

export interface IIngredient {
  id: string;
  name: string;
  quantity: string;
  recipe_id: string;
}

export interface IInstruction {
  id: string;
  step_number: number;
  step_text: string;
  recipe_id: string;
}

export interface IRecipeDetails {
  recipe_id: string;
  title: string;
  description: string;
  image_url: string;
  prep_time: string;
  cook_time: string;
  servings: number;
  created_at: Date;
  updated_at: Date;
  username: string;
  ingredient_id: string | null;
  ingredient_name: string | null;
  quantity: string | null;
  instruction_id: string | null;
  step_number: number | null;
  instruction_description: string | null;
}