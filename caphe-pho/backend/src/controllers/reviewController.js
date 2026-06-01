// src/controllers/reviewController.js
const { z }        = require('zod');
const { query, execute } = require('../db/database');
const { getCache } = require('../cache/redis');

const reviewSchema = z.object({
  stars:   z.number().int().min(1).max(5),
  content: z.string().min(5, 'Nội dung ít nhất 5 ký tự').max(500),
});

// GET /api/cafes/:id/reviews
function getReviews(req, res) {
  const cafe = query('SELECT id FROM cafes WHERE id = ?', [req.params.id]);
  if (!cafe.length) return res.status(404).json({ error: 'Không tìm thấy quán' });

  const reviews = query(
    `SELECT r.*, u.name AS user_display_name
     FROM reviews r LEFT JOIN users u ON r.user_id = u.id
     WHERE r.cafe_id = ? ORDER BY r.created_at DESC`,
    [req.params.id]
  );
  res.json({ data: reviews });
}

// POST /api/cafes/:id/reviews  [requireAuth]
async function createReview(req, res) {
  const parsed = reviewSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0].message });
  }
  const { stars, content } = parsed.data;

  const cafe = query('SELECT id FROM cafes WHERE id = ?', [req.params.id]);
  if (!cafe.length) return res.status(404).json({ error: 'Không tìm thấy quán' });

  // Mỗi user chỉ review 1 quán 1 lần
  const existing = query(
    'SELECT id FROM reviews WHERE cafe_id = ? AND user_id = ?',
    [req.params.id, req.user.id]
  );
  if (existing.length) {
    return res.status(409).json({ error: 'Bạn đã đánh giá quán này rồi' });
  }

  const { lastInsertRowid } = execute(
    'INSERT INTO reviews (cafe_id, user_id, reviewer, stars, content) VALUES (?, ?, ?, ?, ?)',
    [req.params.id, req.user.id, req.user.name, stars, content]
  );

  const newReview = query('SELECT * FROM reviews WHERE id = ?', [lastInsertRowid])[0];

  // Xoá cache liên quan đến quán này
  const cache = await getCache();
  await cache.delPattern('cafes:*');

  // Socket.IO broadcast
  const io = req.app.get('io');
  if (io) {
    io.to(`cafe:${req.params.id}`).emit('new_review', newReview);
    const [stats] = query(
      'SELECT ROUND(AVG(stars),1) AS avg, COUNT(*) AS cnt FROM reviews WHERE cafe_id = ?',
      [req.params.id]
    );
    io.emit('cafe_stats_updated', {
      cafeId:       parseInt(req.params.id),
      avg_rating:   stats.avg ? parseFloat(stats.avg).toFixed(1) : null,
      review_count: parseInt(stats.cnt),
    });
  }

  res.status(201).json({ data: newReview, message: 'Đã gửi đánh giá!' });
}

module.exports = { getReviews, createReview };
