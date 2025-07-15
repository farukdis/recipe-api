import { Request, Response } from 'express';
import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';
import knex from '../../config/db';
import { AuthenticatedRequest } from '../../types';

// Yorum için bir arayüz (interface) tanımlıyoruz.
interface IComment {
  id: string;
  comment_text: string;
  user_id: number;
  recipe_id: string;
  created_at: Date;
  updated_at: Date | null;
}

export const getCommentsByRecipeId = async (req: Request, res: Response) => {
  try {
    const { recipe_id } = req.params;

    const comments = await (knex as Knex)('comments')
      .leftJoin('users', 'comments.user_id', 'users.id')
      .where('comments.recipe_id', recipe_id)
      .select('comments.*', 'users.username')
      .orderBy('comments.created_at', 'desc');

    res.status(200).json({
      message: 'Yorumlar başarıyla getirildi.',
      comments,
    });
  } catch (error) {
    console.error('Yorumları getirme hatası:', error);
    res.status(500).json({
      message: 'Yorumları getirme sırasında bir hata oluştu.',
    });
  }
};

export const createComment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { comment_text } = req.body;
    const { recipe_id } = req.params;
    const userId = req.user.id;

    if (!comment_text || !recipe_id) {
      return res.status(400).json({ message: 'Yorum metni ve tarif kimliği gereklidir.' });
    }

    const newComment: IComment = {
      id: uuidv4(),
      comment_text,
      user_id: userId,
      recipe_id,
      created_at: new Date(),
      updated_at: null,
    };

    await (knex as Knex)<IComment>('comments').insert(newComment);

    res.status(201).json({ message: 'Yorum başarıyla oluşturuldu.', commentId: newComment.id });
  } catch (error) {
    console.error('Yorum oluşturma hatası:', error);
    res.status(500).json({ message: 'Yorum oluşturma sırasında bir hata oluştu.' });
  }
};

export const updateComment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { comment_text } = req.body;
    const userId = req.user.id;

    if (!comment_text) {
      return res.status(400).json({ message: 'Yorum metni gereklidir.' });
    }

    const comment = await (knex as Knex)('comments').where('id', id).first<IComment>();

    if (!comment) {
      return res.status(404).json({ message: 'Yorum bulunamadı.' });
    }

    if (comment.user_id !== userId) {
      return res.status(403).json({ message: 'Bu yorumu güncelleme yetkiniz yok.' });
    }

    await (knex as Knex)('comments').where('id', id).update({
      comment_text,
      updated_at: new Date(),
    });

    res.status(200).json({ message: 'Yorum başarıyla güncellendi.' });
  } catch (error) {
    console.error('Yorumu güncelleme hatası:', error);
    res.status(500).json({ message: 'Yorumu güncellerken bir hata oluştu.' });
  }
};

export const deleteComment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const comment = await (knex as Knex)('comments').where('id', id).first<IComment>();

    if (!comment) {
      return res.status(404).json({ message: 'Yorum bulunamadı.' });
    }

    if (comment.user_id !== userId) {
      return res.status(403).json({ message: 'Bu yorumu silme yetkiniz yok.' });
    }

    await (knex as Knex)('comments').where('id', id).del();

    res.status(200).json({ message: 'Yorum başarıyla silindi.' });
  } catch (error) {
    console.error('Yorumu silme hatası:', error);
    res.status(500).json({ message: 'Yorumu silme sırasında bir hata oluştu.' });
  }
};