// src/db/adapters/sqlite.js
// SQLite via sql.js — pure JS, zero native deps, chạy được trên Node 26+
// Dùng khi chạy local không có PostgreSQL

const initSqlJs = require('sql.js');
const path = require('path');
const fs   = require('fs');

const DB_PATH = path.join(__dirname, '../../../data/caphe.db');

let db = null;

async function init() {
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    db = new SQL.Database(fs.readFileSync(DB_PATH));
  } else {
    db = new SQL.Database();
  }

  db.run('PRAGMA foreign_keys = ON;');
  _wrapRun();
  _initTables();

  console.log('🗃  SQLite (sql.js) ready — local mode');
  return { query, execute };
}

// Patch db.run để auto-persist sau mỗi write
function _wrapRun() {
  const original = db.run.bind(db);
  db.run = (sql, params) => {
    const r = original(sql, params);
    _persist();
    return r;
  };
}

function _persist() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DB_PATH, Buffer.from(db.export()));
}

function _initTables() {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT NOT NULL,
      email      TEXT NOT NULL UNIQUE,
      password   TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now','localtime'))
    );
    CREATE TABLE IF NOT EXISTS cafes (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT NOT NULL,
      address     TEXT NOT NULL,
      tags        TEXT NOT NULL DEFAULT '[]',
      emoji       TEXT NOT NULL DEFAULT '☕',
      description TEXT,
      image_url   TEXT DEFAULT NULL,
      image       TEXT DEFAULT NULL,
      created_at  TEXT DEFAULT (datetime('now','localtime'))
    );
    CREATE TABLE IF NOT EXISTS reviews (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      cafe_id    INTEGER NOT NULL REFERENCES cafes(id) ON DELETE CASCADE,
      user_id    INTEGER REFERENCES users(id) ON DELETE SET NULL,
      reviewer   TEXT NOT NULL,
      stars      INTEGER NOT NULL,
      content    TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now','localtime'))
    );
    CREATE TABLE IF NOT EXISTS favorites (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      cafe_id    INTEGER NOT NULL REFERENCES cafes(id) ON DELETE CASCADE,
      created_at TEXT DEFAULT (datetime('now','localtime')),
      UNIQUE(user_id, cafe_id)
    );
    CREATE INDEX IF NOT EXISTS idx_reviews_cafe ON reviews(cafe_id);
    CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
    CREATE INDEX IF NOT EXISTS idx_favorites_cafe ON favorites(cafe_id);
  `);
  _persist();
}

function query(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

function execute(sql, params = []) {
  db.run(sql, params);
  _persist();

  // Nếu là INSERT, trả về lastInsertRowid bằng cách lấy MAX(id)
  const insertMatch = sql.match(/INSERT INTO\s+(\w+)/i);
  if (insertMatch) {
    const table = insertMatch[1];
    const result = query(`SELECT MAX(id) as id FROM ${table}`);
    if (!result || !result[0]) {
      throw new Error('Không thể lấy ID của dòng vừa insert');
    }
    const id = Number(result[0].id);
    if (isNaN(id) || id === 0) {
      throw new Error(`ID không hợp lệ: ${result[0].id}`);
    }
    return { lastInsertRowid: id };
  }

  // Với UPDATE/DELETE/other, chỉ trả về object rỗng (caller không cần lastInsertRowid)
  return {};
}

module.exports = { init };
