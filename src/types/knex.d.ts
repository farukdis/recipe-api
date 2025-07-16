import { Knex } from 'knex';
import {
  IUser,
  IRecipe,
  IComment,
  IFavorite,
  IIngredient,
  IInstruction,
} from './index';

declare module 'knex/types/tables' {
  interface Tables {
    users: Knex.CompositeTableType<
      IUser,
      Omit<IUser, 'id' | 'password_hash'> & { password_hash: string },
      Omit<IUser, 'id' | 'password_hash'>
    >;
    recipes: Knex.CompositeTableType<
      IRecipe,
      Omit<IRecipe, 'id' | 'created_at' | 'updated_at'>,
      Omit<IRecipe, 'id' | 'created_at'>
    >;
    comments: Knex.CompositeTableType<
      IComment,
      Omit<IComment, 'id' | 'created_at' | 'updated_at'>,
      Omit<IComment, 'id' | 'created_at' | 'user_id' | 'recipe_id'>
    >;
    favorites: Knex.CompositeTableType<
      IFavorite,
      Omit<IFavorite, 'created_at'>
    >;
    ingredients: Knex.CompositeTableType<
      IIngredient,
      Omit<IIngredient, 'id'>
    >;
    instructions: Knex.CompositeTableType<
      IInstruction,
      Omit<IInstruction, 'id'>
    >;
  }
}