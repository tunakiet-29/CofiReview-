// src/db/database.js
// Strategy pattern: dùng PostgreSQL nếu có DATABASE_URL, fallback sang SQLite (sql.js)
// → Chạy local không cần cài Postgres, deploy production dùng Postgres thật

const USE_PG = !!process.env.DATABASE_URL;

let _db = null;

async function getDB() {
  if (_db) return _db;
  if (USE_PG) {
    _db = await require('./adapters/postgres').init();
  } else {
    _db = await require('./adapters/sqlite').init();
  }
  return _db;
}

// Unified query interface — cả 2 adapter đều export { query, execute }
function query(sql, params = []) {
  if (!_db) throw new Error('DB chưa được khởi tạo. Gọi await getDB() trước.');
  return _db.query(sql, params);
}

function execute(sql, params = []) {
  if (!_db) throw new Error('DB chưa được khởi tạo. Gọi await getDB() trước.');
  return _db.execute(sql, params);
}

module.exports = { getDB, query, execute };
