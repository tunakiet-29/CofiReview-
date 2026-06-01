// src/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const { z }  = require('zod');
const { query, execute } = require('../db/database');

const JWT_SECRET  = process.env.JWT_SECRET || 'caphe_pho_dev_secret_change_in_prod';
const JWT_EXPIRES = '7d';

const registerSchema = z.object({
  name:     z.string().min(2, 'Tên ít nhất 2 ký tự').max(50),
  email:    z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu ít nhất 6 ký tự'),
});
const loginSchema = z.object({
  email:    z.string().email('Email không hợp lệ'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

function makeToken(user) {
  return jwt.sign({ id: user.id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

async function register(req, res) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0].message });

  const { name, email, password } = parsed.data;
  if (query('SELECT id FROM users WHERE email = ?', [email]).length)
    return res.status(409).json({ error: 'Email này đã được đăng ký' });

  const hash = await bcrypt.hash(password, 10);
  const { lastInsertRowid } = execute(
    'INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hash]
  );

  const user = { id: lastInsertRowid, name, email };
  res.status(201).json({ token: makeToken(user), user });
}

async function login(req, res) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0].message });

  const { email, password } = parsed.data;
  const rows = query('SELECT * FROM users WHERE email = ?', [email]);
  if (!rows.length) return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });

  const user = rows[0];
  if (!await bcrypt.compare(password, user.password))
    return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });

  const { password: _, ...safeUser } = user;
  res.json({ token: makeToken(safeUser), user: safeUser });
}

function me(req, res) {
  const rows = query('SELECT id, name, email, created_at FROM users WHERE id = ?', [req.user.id]);
  if (!rows.length) return res.status(404).json({ error: 'Không tìm thấy user' });
  res.json({ data: rows[0] });
}

module.exports = { register, login, me };
