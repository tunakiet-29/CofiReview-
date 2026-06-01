# ☕ Cà Phê Phố v2

Web review quán cà phê & trà sữa — **React + Express + SQLite + Socket.IO + JWT**

---

## Cấu trúc thư mục

```
caphe-pho/
├── .github/
│   └── workflows/
│       └── ci.yml              ← GitHub Actions CI/CD
├── backend/
│   ├── data/
│   │   └── seed.js             ← Tạo DB + dữ liệu mẫu
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.js   ← Đăng ký / đăng nhập / JWT
│   │   │   ├── cafeController.js   ← Danh sách, lọc, tìm kiếm quán
│   │   │   └── reviewController.js ← CRUD review + emit Socket.IO
│   │   ├── db/
│   │   │   └── database.js         ← SQLite (sql.js, pure JS)
│   │   ├── middleware/
│   │   │   ├── auth.js             ← requireAuth / optionalAuth
│   │   │   └── errorHandler.js     ← Global error handler
│   │   └── routes/
│   │       ├── authRoutes.js
│   │       ├── cafeRoutes.js
│   │       └── reviewRoutes.js     ← Rate limit 10 reviews/giờ
│   ├── Dockerfile
│   ├── package.json
│   └── server.js               ← Express + Socket.IO entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AuthModal.jsx   ← Modal đăng nhập / đăng ký
│   │   │   ├── CafeCard.jsx    ← Card hiển thị quán
│   │   │   ├── ReviewForm.jsx  ← Form viết review (yêu cầu đăng nhập)
│   │   │   ├── ReviewItem.jsx  ← Review card (highlight review mới)
│   │   │   ├── SearchBar.jsx   ← Search + tag filter + live indicator
│   │   │   ├── StarRating.jsx  ← Sao tương tác / chỉ đọc
│   │   │   └── Toast.jsx       ← Notification popup
│   │   ├── context/
│   │   │   └── AuthContext.jsx ← Global auth state (React Context)
│   │   ├── hooks/
│   │   │   ├── useCafes.js     ← Fetch + debounce search + realtime update
│   │   │   └── useSocket.js    ← Quản lý kết nối Socket.IO
│   │   ├── pages/
│   │   │   ├── HomePage.jsx        ← Danh sách quán
│   │   │   └── CafeDetailPage.jsx  ← Chi tiết + reviews realtime
│   │   ├── services/
│   │   │   └── api.js          ← Axios + auto-attach JWT token
│   │   ├── App.jsx             ← Router + Socket + Toast
│   │   ├── index.css           ← Tailwind + custom animations
│   │   └── main.jsx
│   ├── Dockerfile              ← Multi-stage: Vite build → Nginx
│   ├── nginx.conf              ← SPA routing + API proxy
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js          ← Dev proxy /api → :3001
│
├── docker-compose.yml          ← Chạy cả stack 1 lệnh
├── .env.example
├── .gitignore
└── README.md
```

---

## Tính năng

| Tính năng | Chi tiết |
|-----------|---------|
| **Duyệt & lọc quán** | Lọc theo tag (cà phê / trà sữa / matcha), xem rating |
| **Tìm kiếm realtime** | Debounce 350ms, kết hợp được với tag filter |
| **JWT Authentication** | Đăng ký / đăng nhập, token 7 ngày, auto-attach axios |
| **Viết review** | Chỉ khi đăng nhập, mỗi user review 1 quán 1 lần |
| **Realtime Socket.IO** | Review mới broadcast đến tất cả client đang xem quán |
| **Rate limiting** | Tối đa 10 review/giờ/IP |
| **Zod validation** | Validate input cả backend lẫn frontend |

---

## Cài đặt & chạy

### Yêu cầu
- **Node.js** >= 18
- **npm** >= 9
- (Tuỳ chọn) Docker + Docker Compose

---

### Cách 1: Chạy local (Development)

**Bước 1 — Backend**
```bash
cd backend

# Cài dependencies
npm install

# Tạo database + seed dữ liệu mẫu
npm run seed

# Chạy dev server (nodemon — tự reload khi sửa code)
npm run dev
# → http://localhost:3001
```

**Bước 2 — Frontend** (terminal mới)
```bash
cd frontend

# Cài dependencies
npm install

# Chạy Vite dev server
npm run dev
# → http://localhost:5173
```

**Bước 3 — Mở trình duyệt**
```
http://localhost:5173
```

Demo account sẵn có: `minh@demo.com` / `demo1234`

---

### Cách 2: Docker Compose (Production-like)

```bash
# Ở root của project
docker compose up --build

# Truy cập:
# Frontend → http://localhost
# Backend  → http://localhost:3001
```

---

### Biến môi trường

Tạo file `.env` trong thư mục `backend/`:
```env
JWT_SECRET=your_strong_secret_min_32_chars
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

Tạo file `.env` trong thư mục `frontend/`:
```env
VITE_SOCKET_URL=http://localhost:3001
```

---

## API Endpoints

### Auth
| Method | Endpoint | Body | Mô tả |
|--------|----------|------|-------|
| POST | `/api/auth/register` | `{name, email, password}` | Đăng ký tài khoản |
| POST | `/api/auth/login` | `{email, password}` | Đăng nhập, nhận JWT |
| GET  | `/api/auth/me` | — | Thông tin user (cần token) |

### Cafes
| Method | Endpoint | Query | Mô tả |
|--------|----------|-------|-------|
| GET | `/api/cafes` | `search`, `tag` | Danh sách quán |
| GET | `/api/cafes/:id` | — | Chi tiết 1 quán |

### Reviews
| Method | Endpoint | Body | Mô tả |
|--------|----------|------|-------|
| GET  | `/api/cafes/:id/reviews` | — | Danh sách reviews |
| POST | `/api/cafes/:id/reviews` | `{stars, content}` | Tạo review (cần JWT) |

---

## Socket.IO Events

| Event | Hướng | Mô tả |
|-------|-------|-------|
| `join_cafe` | Client → Server | Join room của quán |
| `leave_cafe` | Client → Server | Rời room |
| `new_review` | Server → Client | Review mới trong quán |
| `cafe_stats_updated` | Server → Tất cả | Cập nhật avg_rating |

---

## Deploy lên Railway

1. Push code lên GitHub
2. Vào [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Add variables: `JWT_SECRET`, `FRONTEND_URL`
4. Railway tự detect Dockerfile và deploy

---

## Tech Stack

**Backend:** Node.js · Express · sql.js (SQLite) · Socket.IO · jsonwebtoken · bcryptjs · Zod · express-rate-limit

**Frontend:** React 18 · React Router v6 · Tailwind CSS · Axios · socket.io-client · Vite

**DevOps:** Docker · Docker Compose · Nginx · GitHub Actions
