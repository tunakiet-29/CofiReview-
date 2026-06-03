// data/seed.js — tạo DB và nhập dữ liệu mẫu
const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, 'caphe.db');
if (fs.existsSync(DB_PATH)) { fs.unlinkSync(DB_PATH); console.log('🗑  Xoá DB cũ'); }

async function seed() {
  const SQL = await initSqlJs();
  const db = new SQL.Database();
  db.run('PRAGMA foreign_keys = ON;');

  db.run(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, password TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now','localtime'))
    );
    CREATE TABLE cafes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL, address TEXT NOT NULL,
      tags TEXT NOT NULL DEFAULT '[]', emoji TEXT NOT NULL DEFAULT '☕', description TEXT,
      created_at TEXT DEFAULT (datetime('now','localtime'))
    );
    CREATE TABLE reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cafe_id INTEGER NOT NULL REFERENCES cafes(id) ON DELETE CASCADE,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      reviewer TEXT NOT NULL, stars INTEGER NOT NULL, content TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now','localtime'))
    );
    CREATE TABLE favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      cafe_id INTEGER NOT NULL REFERENCES cafes(id) ON DELETE CASCADE,
      created_at TEXT DEFAULT (datetime('now','localtime')),
      UNIQUE(user_id, cafe_id)
    );
    CREATE INDEX idx_reviews_cafe ON reviews(cafe_id);
  `);

  // Demo users
  const hash = await bcrypt.hash('demo1234', 10);
  const users = [
    ['Minh Trí', 'minh@demo.com', hash],
    ['Thu Hương', 'thu@demo.com', hash],
    ['Lan Anh', 'lan@demo.com', hash],
  ];
  users.forEach(([name, email, pw]) =>
    db.run('INSERT INTO users (name,email,password) VALUES (?,?,?)', [name, email, pw]));

  const cafes = [
    ['The Workshop Coffee','27 Ngô Đức Kế, Q.1, TP.HCM','["cà phê","specialty"]','☕','Không gian tối giản, single origin rang nhẹ. Barista chuyên nghiệp.'],
    ['Phúc Long Heritage','35 Bùi Thị Xuân, Đà Lạt','["trà sữa","cà phê"]','🧋','Thương hiệu lâu đời với trà Đà Lạt chính hãng.'],
    ['Matcha Nami','18 Hoàng Hoa Thám, Hà Nội','["matcha","trà sữa"]','🍵','Chuyên matcha Nhật nhập khẩu, từ latte đến bánh handmade.'],
    ['Cà Phê Trung Nguyên Legend','52 Hai Bà Trưng, Huế','["cà phê"]','🫖','Di sản cà phê Việt, không gian truyền thống Huế.'],
    ['Gong Cha','12 Lê Lợi, TP.HCM','["trà sữa"]','🧉','Trà sữa Đài Loan, topping đa dạng, trà oolong đặc trưng.'],
    ['Somewhere Coffee','14 Trần Hưng Đạo, Đà Nẵng','["cà phê","specialty"]','☕','Roastery tự rang, industrial chic, view biển Đà Nẵng.'],
  ];
  cafes.forEach(([name,addr,tags,emoji,desc]) =>
    db.run('INSERT INTO cafes (name,address,tags,emoji,description) VALUES (?,?,?,?,?)',[name,addr,tags,emoji,desc]));

  const reviews = [
    [1,1,'Minh Trí',5,'Flat white mịn và thơm, không gian yên tĩnh phù hợp làm việc.'],
    [1,2,'Thu Hương',4,'Hơi đắt nhưng chất lượng xứng đáng. Nhân viên thân thiện.'],
    [2,3,'Lan Anh',5,'Trà sữa Phúc Long vẫn số 1! Trà thơm tự nhiên, không bị ngọt gắt.'],
    [2,null,'Quốc Bảo',4,'Trà đào cam sả ngon xuất sắc. Hơi đông người nhưng phục vụ nhanh.'],
    [2,null,'Tú Anh',5,'Đồ uống nhất quán. Favourite spot mỗi khi đến Đà Lạt!'],
    [3,null,'Bảo Ngân',5,'Matcha latte đậm đà, không ngọt gắt. Uống một lần là ghiền!'],
    [3,null,'Hải Long',3,'Ngon nhưng phần hơi nhỏ so với giá.'],
    [4,null,'Thanh Tâm',4,'Cà phê phin truyền thống đúng vị Huế. Uống cùng bánh in rất hợp.'],
    [5,null,'Mỹ Duyên',4,'Milk foam trà vẫn ngon nhất. Luôn order Assam Milk Tea.'],
    [5,null,'Khánh Linh',5,'Taro milk tea và roasted milk tea là hai món yêu thích.'],
    [5,null,'Văn Đức',3,'Bình thường, không có gì đặc biệt so với cùng tầm giá.'],
    [6,null,'Ngọc Mai',5,'View biển cực đẹp, cà phê ngon. Cortado ở đây là best!'],
    [6,null,'Tuấn Kiệt',4,'Cà phê ngon, không gian rộng. Cuối tuần đông nhưng không ồn.'],
  ];
  reviews.forEach(([cafe_id,user_id,reviewer,stars,content]) =>
    db.run('INSERT INTO reviews (cafe_id,user_id,reviewer,stars,content) VALUES (?,?,?,?,?)',
      [cafe_id, user_id ?? null, reviewer, stars, content]));

  // Sample favorite data
  [[1,1],[3,1],[5,2]].forEach(([cafeId,userId]) =>
    db.run('INSERT INTO favorites (user_id,cafe_id) VALUES (?,?)', [userId, cafeId]));

  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
  console.log(`✅ Seed xong! ${cafes.length} quán, ${reviews.length} reviews, ${users.length} users`);
  console.log('📧 Demo login: minh@demo.com / demo1234');
}

seed().catch(console.error);
