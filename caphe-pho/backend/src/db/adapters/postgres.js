// src/db/adapters/postgres.js
// PostgreSQL adapter dùng khi có DATABASE_URL (Railway, Render, Supabase...)
// Dùng pg (node-postgres) thuần — không cần ORM

const { Pool } = require('pg');

let pool = null;

async function init() {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }   // Railway / Render cần ssl
      : false,
    max: 10,                            // connection pool size
    idleTimeoutMillis: 30000,
  });

  // Test connection
  const client = await pool.connect();
  await client.query('SELECT 1');
  client.release();

  await _initTables();
  console.log('🐘  PostgreSQL ready — production mode');
  return { query, execute };
}

async function _initTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id         SERIAL PRIMARY KEY,
      name       TEXT NOT NULL,
      email      TEXT NOT NULL UNIQUE,
      password   TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS cafes (
      id          SERIAL PRIMARY KEY,
      name        TEXT NOT NULL,
      address     TEXT NOT NULL,
      tags        TEXT NOT NULL DEFAULT '[]',
      emoji       TEXT NOT NULL DEFAULT '☕',
      description TEXT,
      created_at  TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS reviews (
      id         SERIAL PRIMARY KEY,
      cafe_id    INTEGER NOT NULL REFERENCES cafes(id) ON DELETE CASCADE,
      user_id    INTEGER REFERENCES users(id) ON DELETE SET NULL,
      reviewer   TEXT NOT NULL,
      stars      INTEGER NOT NULL CHECK(stars BETWEEN 1 AND 5),
      content    TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_reviews_cafe ON reviews(cafe_id);
  `);
}

// Query interface giống SQLite để controllers dùng chung
async function query(sql, params = []) {
  // PostgreSQL dùng $1 $2..., SQLite dùng ?
  // Convert ? → $1, $2...
  let i = 0;
  const pgSql = sql.replace(/\?/g, () => `$${++i}`);
  const { rows } = await pool.query(pgSql, params);
  return rows;
}

async function execute(sql, params = []) {
  let i = 0;
  const pgSql = sql.replace(/\?/g, () => `$${++i}`);
  // Lấy id của row vừa insert
  const insertSql = pgSql.replace(/;?\s*$/, ' RETURNING id');
  const { rows } = await pool.query(insertSql, params);
  return { lastInsertRowid: rows[0]?.id };
}

module.exports = { init };
