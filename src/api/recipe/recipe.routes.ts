import express, { Router, Request, Response, NextFunction } from 'express';
import * as recipeController from './recipe.controller';
import authenticateToken from '../../middleware/auth';
import { AuthenticatedRequest } from '../../types';
import { z } from 'zod';

const router: Router = express.Router();

// Zod ile tarif oluşturma için doğrulama şeması
export const createRecipeSchema = z.object({
  title: z.string().min(3, { message: 'Tarif başlığı en az 3 karakter olmalıdır.' }),
  description: z.string().min(10, { message: 'Tarif açıklaması en az 10 karakter olmalıdır.' }),
  image_url: z.string().url({ message: 'Geçerli bir resim URL\'si giriniz.' }).optional(),
  prep_time: z.number().int().min(0, { message: 'Hazırlık süresi pozitif bir sayı olmalıdır.' }),
  cook_time: z.number().int().min(0, { message: 'Pişirme süresi pozitif bir sayı olmalıdır.' }),
  servings: z.number().int().min(1, { message: 'Porsiyon sayısı en az 1 olmalıdır.' }),
  ingredients: z.array(
    z.object({
      name: z.string().min(1, { message: 'Malzeme adı boş olamaz.' }),
      quantity: z.string().min(1, { message: 'Malzeme miktarı boş olamaz.' }).optional(),
    })
  ).min(1, { message: 'En az bir malzeme girmelisiniz.' }),
  instructions: z.array(
    z.object({
      step_number: z.number().int().min(1, { message: 'Adım numarası pozitif bir tam sayı olmalıdır.' }),
      step_text: z.string().min(10, { message: 'Talimat metni en az 10 karakter olmalıdır.' }),
    })
  ).min(1, { message: 'En az bir talimat girmelisiniz.' }),
});

// Zod ile tarif güncelleme için doğrulama şeması (tüm alanlar isteğe bağlı)
export const updateRecipeSchema = createRecipeSchema.partial();

// Zod şemalarını kullanarak doğrulama yapan jenerik middleware
const validate = (schema: z.ZodObject<any, any>) => (req: Request, res: Response, next: NextFunction) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.issues.map(issue => ({ path: issue.path, message: issue.message })) });
    }
    next(error);
  }
};

router.get('/', recipeController.getAllRecipes);
router.get('/:id/details', recipeController.getRecipeDetails);
router.get('/:id', recipeController.getRecipeById);

router.post('/', authenticateToken, validate(createRecipeSchema), (req, res) => recipeController.createRecipe(req as AuthenticatedRequest, res));
router.put('/:id', authenticateToken, validate(updateRecipeSchema), (req, res) => recipeController.updateRecipe(req as AuthenticatedRequest, res));
router.delete('/:id', authenticateToken, (req, res) => recipeController.deleteRecipe(req as AuthenticatedRequest, res));

export default router;