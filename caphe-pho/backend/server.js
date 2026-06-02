// server.js
require('dotenv').config();
const express        = require('express');
const { createServer } = require('http');
const { Server }     = require('socket.io');
const cors           = require('cors');
const swaggerUi      = require('swagger-ui-express');
const swaggerSpec    = require('./src/config/swagger');
const authRoutes     = require('./src/routes/authRoutes');
const cafeRoutes     = require('./src/routes/cafeRoutes');
const reviewRoutes   = require('./src/routes/reviewRoutes');
const favoriteRoutes = require('./src/routes/favoriteRoutes');
const imageRoutes = require('./src/routes/imageRoutes');
const errorHandler   = require('./src/middleware/errorHandler');
const { getDB }      = require('./src/db/database');

const app        = express();
const path       = require('path');
const httpServer = createServer(app);
const PORT       = process.env.PORT || 3001;
const ORIGIN     = process.env.FRONTEND_URL || 'http://localhost:5173';

// ── Socket.IO ───────────────────────────────────────────────
const io = new Server(httpServer, {
  cors: { origin: ORIGIN, methods: ['GET','POST'] },
});
io.on('connection', (socket) => {
  socket.on('join_cafe',  (id) => socket.join(`cafe:${id}`));
  socket.on('leave_cafe', (id) => socket.leave(`cafe:${id}`));
});
app.set('io', io);

// ── Middleware ──────────────────────────────────────────────
app.use(cors({ origin: ORIGIN }));
app.use(express.json());

// Serve static assets (images, uploads, etc.) from /public
app.use(express.static(path.join(__dirname, 'public')));

// ── Swagger UI ──────────────────────────────────────────────
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: '☕ Cà Phê Phố API Docs',
  customCss: '.swagger-ui .topbar { background-color: #2c1810 }',
}));

// ── Routes ──────────────────────────────────────────────────
app.use('/api/auth',  authRoutes);
app.use('/api/cafes', cafeRoutes);
app.use('/api/cafes/:id/reviews', reviewRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/images', imageRoutes);
app.get('/api/health', (_, res) => res.json({ status: 'ok', node: process.version }));

app.use((req, res) => res.status(404).json({ error: `Không tìm thấy: ${req.method} ${req.path}` }));
app.use(errorHandler);

// ── Start ───────────────────────────────────────────────────
getDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`\n☕  Cà Phê Phố API  →  http://localhost:${PORT}`);
    console.log(`📖  Swagger Docs   →  http://localhost:${PORT}/api-docs`);
    console.log(`🐘  DB mode: ${process.env.DATABASE_URL ? 'PostgreSQL' : 'SQLite (local)'}`);
    console.log(`⚡  Cache: ${process.env.REDIS_URL ? 'Redis' : 'In-memory (local)'}\n`);
  });
});
