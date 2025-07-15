const knex = require("../../config/db");
const { v4: uuidv4 } = require('uuid');

exports.getCommentsByRecipeId = async (req, res) => {
  try {
    const { recipe_id } = req.params;

    const comments = await knex('comments')
      .leftJoin('users', 'comments.user_id', 'users.id')
      .where('comments.recipe_id', recipe_id)
      .select('comments.*', 'users.username')
      .orderBy('comments.created_at', 'desc');

    res.status(200).json({
      message: "Yorumlar başarıyla getirildi.",
      comments,
    });
  } catch (error) {
    console.error("Yorumları getirme hatası:", error);
    res.status(500).json({
      message: "Yorumları getirme sırasında bir hata oluştu."
    });
  }
};

exports.createComment = async (req, res) => {
  try {
    const { comment_text } = req.body;
    const { recipe_id } = req.params;
    const userId = req.user.id; // Doğrulama ara yazılımından gelen kullanıcı ID'si

    if (!comment_text || !recipe_id) {
      return res.status(400).json({ message: "Yorum metni ve tarif kimliği gereklidir." });
    }

    const newComment = {
      id: uuidv4(),
      comment_text,
      user_id: userId,
      recipe_id: recipe_id,
      created_at: knex.fn.now()
    };

    await knex('comments').insert(newComment);

    res.status(201).json({ message: 'Yorum başarıyla oluşturuldu.', commentId: newComment.id });

  } catch (error) {
    console.error("Yorum oluşturma hatası:", error);
    res.status(500).json({ message: "Yorum oluşturma sırasında bir hata oluştu." });
  }
};