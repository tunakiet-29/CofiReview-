// src/controllers/reviewController.js
const { z } = require('zod');
const { query, execute } = require('../db/database');
const { getCache } = require('../cache/redis');

const reviewSchema = z.object({
  stars: z.number().int().min(1).max(5),
  content: z.string().min(5, 'Nội dung ít nhất 5 ký tự').max(500),
});

function getCafeStats(cafeId) {
  const [stats] = query(
    'SELECT ROUND(AVG(stars),1) AS avg, COUNT(*) AS cnt FROM reviews WHERE cafe_id = ?',
    [cafeId]
  );

  return {
    avg_rating: stats.avg ? parseFloat(stats.avg).toFixed(1) : null,
    review_count: parseInt(stats.cnt) || 0,
  };
}

function emitCafeStats(req, cafeId, stats) {
  const io = req.app.get('io');
  if (!io) return;

  io.emit('cafe_stats_updated', {
    cafeId: parseInt(cafeId),
    ...stats,
  });
}

async function invalidateCafeCache() {
  const cache = await getCache();
  await cache.delPattern('cafes:*');
}

function findReview(cafeId, reviewId) {
  return query(
    'SELECT * FROM reviews WHERE id = ? AND cafe_id = ?',
    [reviewId, cafeId]
  )[0];
}

function ensureReviewOwner(review, userId) {
  return Number(review.user_id) === Number(userId);
}

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

  console.log('✅ Review inserted:', { lastInsertRowid, cafeId: req.params.id, userId: req.user.id });

  // Lấy review vừa tạo với đầy đủ thông tin
  const newReviewRows = query(
    `SELECT r.*, u.name AS user_display_name
     FROM reviews r LEFT JOIN users u ON r.user_id = u.id
     WHERE r.id = ?`,
    [lastInsertRowid]
  );

  console.log('🔍 Query result:', { lastInsertRowid, rowsFound: newReviewRows.length, data: newReviewRows });
  
  if (!newReviewRows || newReviewRows.length === 0) {
    console.error('❌ Không tìm thấy review:', { lastInsertRowid, cafeId: req.params.id, userId: req.user.id });
    return res.status(500).json({ error: 'Không thể lấy dữ liệu review vừa tạo' });
  }
  
  const newReview = newReviewRows[0];

  await invalidateCafeCache();

  const io = req.app.get('io');
  const stats = getCafeStats(req.params.id);
  if (io) {
    io.to(`cafe:${req.params.id}`).emit('new_review', newReview);
    emitCafeStats(req, req.params.id, stats);
  }

  res.status(201).json({ data: newReview, stats, message: 'Đã gửi đánh giá!' });
}

// PATCH /api/cafes/:id/reviews/:reviewId  [requireAuth]
async function updateReview(req, res) {
  const parsed = reviewSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0].message });
  }

  const { id: cafeId, reviewId } = req.params;
  const review = findReview(cafeId, reviewId);
  if (!review) {
    return res.status(404).json({ error: 'Không tìm thấy đánh giá' });
  }
  if (!ensureReviewOwner(review, req.user.id)) {
    return res.status(403).json({ error: 'Bạn không có quyền sửa đánh giá này' });
  }

  const { stars, content } = parsed.data;
  execute(
    'UPDATE reviews SET stars = ?, content = ? WHERE id = ?',
    [stars, content, reviewId]
  );

  const updatedReview = query(
    `SELECT r.*, u.name AS user_display_name
     FROM reviews r LEFT JOIN users u ON r.user_id = u.id
     WHERE r.id = ?`,
    [reviewId]
  )[0];
  await invalidateCafeCache();

  const stats = getCafeStats(cafeId);
  emitCafeStats(req, cafeId, stats);

  res.json({
    data: updatedReview,
    stats,
    message: 'Đã cập nhật đánh giá',
  });
}

// DELETE /api/cafes/:id/reviews/:reviewId  [requireAuth]
async function deleteReview(req, res) {
  const { id: cafeId, reviewId } = req.params;
  const review = findReview(cafeId, reviewId);
  if (!review) {
    return res.status(404).json({ error: 'Không tìm thấy đánh giá' });
  }
  if (!ensureReviewOwner(review, req.user.id)) {
    return res.status(403).json({ error: 'Bạn không có quyền xóa đánh giá này' });
  }

  execute('DELETE FROM reviews WHERE id = ?', [reviewId]);
  await invalidateCafeCache();

  const stats = getCafeStats(cafeId);
  emitCafeStats(req, cafeId, stats);

  res.json({
    deletedId: Number(reviewId),
    stats,
    message: 'Đã xóa đánh giá',
  });
}

module.exports = {
  getReviews,
  createReview,
  updateReview,
  deleteReview,
};
