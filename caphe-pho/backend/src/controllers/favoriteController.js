const { query, execute } = require('../db/database');

async function listFavorites(req, res) {
  const rows = query(`
    SELECT c.*, ROUND(AVG(r.stars), 1) AS avg_rating, COUNT(r.id) AS review_count
    FROM favorites f
    JOIN cafes c ON c.id = f.cafe_id
    LEFT JOIN reviews r ON r.cafe_id = c.id
    WHERE f.user_id = ?
    GROUP BY c.id
    ORDER BY c.name ASC
  `, [req.user.id]);

  const data = rows.map(row => ({
    ...row,
    tags: JSON.parse(row.tags || '[]'),
    avg_rating: row.avg_rating ? parseFloat(row.avg_rating).toFixed(1) : null,
    review_count: parseInt(row.review_count) || 0,
    favorited: true,
  }));

  res.json({ data });
}

async function addFavorite(req, res) {
  const cafeId = Number(req.params.cafeId);
  if (!cafeId) return res.status(400).json({ error: 'ID quán không hợp lệ' });

  const cafe = query('SELECT id FROM cafes WHERE id = ?', [cafeId]);
  if (!cafe.length) return res.status(404).json({ error: 'Quán không tồn tại' });

  const existing = query('SELECT id FROM favorites WHERE user_id = ? AND cafe_id = ?', [req.user.id, cafeId]);
  if (existing.length) return res.status(409).json({ error: 'Quán đã có trong yêu thích' });

  execute('INSERT INTO favorites (user_id, cafe_id) VALUES (?, ?)', [req.user.id, cafeId]);
  res.json({ data: { cafe_id: cafeId, favorited: true } });
}

async function removeFavorite(req, res) {
  const cafeId = Number(req.params.cafeId);
  if (!cafeId) return res.status(400).json({ error: 'ID quán không hợp lệ' });

  const cafe = query('SELECT id FROM cafes WHERE id = ?', [cafeId]);
  if (!cafe.length) return res.status(404).json({ error: 'Quán không tồn tại' });

  execute('DELETE FROM favorites WHERE user_id = ? AND cafe_id = ?', [req.user.id, cafeId]);
  res.json({ data: { cafe_id: cafeId, favorited: false } });
}

module.exports = { listFavorites, addFavorite, removeFavorite };
