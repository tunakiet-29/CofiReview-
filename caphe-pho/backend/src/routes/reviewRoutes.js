// src/routes/reviewRoutes.js
const express    = require('express');
const router     = express.Router({ mergeParams: true });
const { getReviews, createReview } = require('../controllers/reviewController');
const { requireAuth } = require('../middleware/auth');
const rateLimit  = require('express-rate-limit');

const reviewLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { error: 'Bạn đã gửi quá nhiều review. Vui lòng thử lại sau 1 giờ.' },
});

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Đánh giá quán
 */

/**
 * @swagger
 * /cafes/{id}/reviews:
 *   get:
 *     summary: Lấy tất cả reviews của 1 quán
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Danh sách reviews, mới nhất trên đầu
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Review' }
 */
router.get('/', getReviews);

/**
 * @swagger
 * /cafes/{id}/reviews:
 *   post:
 *     summary: Gửi review mới (yêu cầu đăng nhập)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [stars, content]
 *             properties:
 *               stars:   { type: integer, minimum: 1, maximum: 5, example: 5 }
 *               content: { type: string, minLength: 5, example: Cà phê rất ngon! }
 *     responses:
 *       201:
 *         description: Review đã được gửi thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Chưa đăng nhập
 *       409:
 *         description: Bạn đã review quán này rồi
 *       429:
 *         description: Gửi quá nhiều review (rate limit)
 */
router.post('/', requireAuth, reviewLimiter, createReview);

module.exports = router;
