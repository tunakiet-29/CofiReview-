// data/seed.local.js — seed cho SQLite local (không cần Postgres)
require('dotenv').config();
const initSqlJs = require('sql.js');
const path  = require('path');
const fs    = require('fs');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, 'caphe.db');
if (fs.existsSync(DB_PATH)) { fs.unlinkSync(DB_PATH); console.log('🗑  Xoá DB cũ'); }

async function seed() {
  const SQL = await initSqlJs();
  const db  = new SQL.Database();
  db.run('PRAGMA foreign_keys = ON;');

  db.run(`
    CREATE TABLE users   (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, password TEXT NOT NULL, created_at TEXT DEFAULT (datetime('now','localtime')));
    CREATE TABLE cafes   (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, address TEXT NOT NULL, tags TEXT NOT NULL DEFAULT '[]', emoji TEXT NOT NULL DEFAULT '☕', description TEXT, image TEXT DEFAULT NULL, created_at TEXT DEFAULT (datetime('now','localtime')));
    CREATE TABLE reviews (id INTEGER PRIMARY KEY AUTOINCREMENT, cafe_id INTEGER NOT NULL REFERENCES cafes(id) ON DELETE CASCADE, user_id INTEGER REFERENCES users(id) ON DELETE SET NULL, reviewer TEXT NOT NULL, stars INTEGER NOT NULL, content TEXT NOT NULL, created_at TEXT DEFAULT (datetime('now','localtime')));
    CREATE TABLE favorites (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, cafe_id INTEGER NOT NULL REFERENCES cafes(id) ON DELETE CASCADE, created_at TEXT DEFAULT (datetime('now','localtime')), UNIQUE(user_id,cafe_id));
    CREATE INDEX idx_reviews_cafe ON reviews(cafe_id);
  `);

  const hash = await bcrypt.hash('demo1234', 10);
  [['Minh Trí','minh@demo.com'],['Thu Hương','thu@demo.com'],['Lan Anh','lan@demo.com']]
    .forEach(([n,e]) => db.run('INSERT INTO users (name,email,password) VALUES (?,?,?)',[n,e,hash]));

  [
    ['The Workshop Coffee','27 Ngô Đức Kế, Q.1, TP.HCM','["cà phê","specialty"]','☕','Không gian tối giản, single origin rang nhẹ.','/images/cafe-1.svg'],
    ['Phúc Long Heritage','35 Bùi Thị Xuân, Đà Lạt','["trà sữa","cà phê"]','🧋','Thương hiệu lâu đời với trà Đà Lạt chính hãng.','/images/cafe-2.svg'],
    ['Matcha Nami','18 Hoàng Hoa Thám, Hà Nội','["matcha","trà sữa"]','🍵','Chuyên matcha Nhật nhập khẩu, từ latte đến bánh handmade.','/images/cafe-3.svg'],
    ['Cà Phê Trung Nguyên Legend','52 Hai Bà Trưng, Huế','["cà phê"]','🫖','Di sản cà phê Việt, không gian truyền thống Huế.','/images/cafe-4.svg'],
    ['Gong Cha','12 Lê Lợi, TP.HCM','["trà sữa"]','🧉','Trà sữa Đài Loan, topping đa dạng.','/images/cafe-5.svg'],
    ['Somewhere Coffee','14 Trần Hưng Đạo, Đà Nẵng','["cà phê","specialty"]','☕','Roastery tự rang, view biển Đà Nẵng.','/images/cafe-6.svg'],
  ].forEach(([n,a,t,e,d,img]) => db.run('INSERT INTO cafes (name,address,tags,emoji,description,image) VALUES (?,?,?,?,?,?)',[n,a,t,e,d,img]));

  [
    [1,1,'Minh Trí',5,'Flat white mịn và thơm. Không gian yên tĩnh phù hợp làm việc.'],
    [1,2,'Thu Hương',4,'Hơi đắt nhưng chất lượng xứng đáng. Nhân viên thân thiện.'],
    [2,3,'Lan Anh',5,'Trà sữa Phúc Long vẫn số 1! Trà thơm tự nhiên.'],
    [2,null,'Quốc Bảo',4,'Trà đào cam sả ngon xuất sắc.'],
    [3,null,'Bảo Ngân',5,'Matcha latte đậm đà. Uống một lần là ghiền!'],
    [3,null,'Hải Long',3,'Ngon nhưng phần hơi nhỏ so với giá.'],
    [4,null,'Thanh Tâm',4,'Cà phê phin truyền thống đúng vị Huế.'],
    [5,null,'Mỹ Duyên',4,'Milk foam trà vẫn ngon nhất.'],
    [5,null,'Khánh Linh',5,'Taro milk tea là món yêu thích.'],
    [6,null,'Ngọc Mai',5,'View biển cực đẹp, cà phê ngon. Cortado best!'],
    [6,null,'Tuấn Kiệt',4,'Cà phê ngon, không gian rộng.'],
  ].forEach(([c,u,r,s,t]) => db.run('INSERT INTO reviews (cafe_id,user_id,reviewer,stars,content) VALUES (?,?,?,?,?)',[c,u??null,r,s,t]));

  // Sample favorite data
  [[1,1],[3,1],[5,2]].forEach(([cafeId,userId]) =>
    db.run('INSERT INTO favorites (user_id, cafe_id) VALUES (?,?)', [userId, cafeId]));

  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, Buffer.from(db.export()));
  console.log('✅ Seed xong! 6 quán, 11 reviews, 3 users');
  console.log('📧 Demo: minh@demo.com / demo1234');
}
seed().catch(console.error);
