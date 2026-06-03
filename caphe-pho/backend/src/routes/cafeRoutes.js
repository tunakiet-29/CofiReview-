// src/routes/cafeRoutes.js
const express = require('express');
const router  = express.Router();
const { optionalAuth } = require('../middleware/auth');
const { getCafes, getCafeById } = require('../controllers/cafeController');

/**
 * @swagger
 * tags:
 *   name: Cafes
 *   description: Danh sách và chi tiết quán
 */

/**
 * @swagger
 * /cafes:
 *   get:
 *     summary: Lấy danh sách tất cả quán
 *     tags: [Cafes]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Tìm theo tên hoặc địa chỉ
 *         example: Workshop
 *       - in: query
 *         name: tag
 *         schema: { type: string, enum: [cà phê, trà sữa, matcha] }
 *         description: Lọc theo loại đồ uống
 *     responses:
 *       200:
 *         description: Danh sách quán (có cache 60s)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Cafe' }
 *                 cached: { type: boolean }
 */
router.get('/',    optionalAuth, getCafes);

/**
 * @swagger
 * /cafes/{id}:
 *   get:
 *     summary: Chi tiết 1 quán
 *     tags: [Cafes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Thông tin quán
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cafe'
 *       404:
 *         description: Không tìm thấy quán
 */
router.get('/:id', optionalAuth, getCafeById);

module.exports = router;
