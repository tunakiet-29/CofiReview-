// src/controllers/cafeController.js
// Cache layer: GET /cafes → cache 60s, tự invalidate khi có review mới

const { query }    = require('../db/database');
const { getCache } = require('../cache/redis');

function formatCafe(row) {
  if (!row) return null;
  return {
    ...row,
    tags:         JSON.parse(row.tags || '[]'),
    avg_rating:   row.avg_rating  ? parseFloat(row.avg_rating).toFixed(1)  : null,
    review_count: parseInt(row.review_count) || 0,
  };
}

// GET /api/cafes?search=&tag=
async function getCafes(req, res) {
  const { search = '', tag = '' } = req.query;
  const cacheKey = `cafes:${search.trim()}:${tag.trim()}`;

  // Thử lấy từ cache trước
  const cache = await getCache();
  const cached = await cache.get(cacheKey);
  if (cached) {
    return res.json({ data: cached, cached: true });
  }

  // Cache miss → query DB
  let sql = `
    SELECT c.*, ROUND(AVG(r.stars), 1) AS avg_rating, COUNT(r.id) AS review_count
    FROM cafes c LEFT JOIN reviews r ON r.cafe_id = c.id
    WHERE 1=1
  `;
  const params = [];
  if (search.trim()) {
    sql += ' AND (c.name LIKE ? OR c.address LIKE ?)';
    const like = `%${search.trim()}%`;
    params.push(like, like);
  }
  if (tag.trim()) {
    sql += ' AND c.tags LIKE ?';
    params.push(`%${tag.trim()}%`);
  }
  sql += ' GROUP BY c.id ORDER BY c.name ASC';

  const rows = query(sql, params).map(formatCafe);

  // Lưu vào cache 60 giây
  await cache.set(cacheKey, rows, 60);

  res.json({ data: rows, cached: false });
}

// GET /api/cafes/:id
async function getCafeById(req, res) {
  const rows = query(`
    SELECT c.*, ROUND(AVG(r.stars), 1) AS avg_rating, COUNT(r.id) AS review_count
    FROM cafes c LEFT JOIN reviews r ON r.cafe_id = c.id
    WHERE c.id = ? GROUP BY c.id
  `, [req.params.id]);

  if (!rows.length) return res.status(404).json({ error: 'Không tìm thấy quán' });
  res.json({ data: formatCafe(rows[0]) });
}

module.exports = { getCafes, getCafeById };
