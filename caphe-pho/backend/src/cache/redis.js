// src/cache/redis.js
// Redis cache — dùng khi có REDIS_URL, fallback sang in-memory Map nếu không có
// → Chạy local không cần cài Redis

const USE_REDIS = !!process.env.REDIS_URL;

// ── In-memory fallback (development) ───────────────────────
const memStore = new Map();

const memCache = {
  async get(key) {
    const item = memStore.get(key);
    if (!item) return null;
    if (Date.now() > item.expiry) { memStore.delete(key); return null; }
    return item.value;
  },
  async set(key, value, ttlSeconds = 60) {
    memStore.set(key, { value, expiry: Date.now() + ttlSeconds * 1000 });
  },
  async del(key) { memStore.delete(key); },
  async delPattern(pattern) {
    const regex = new RegExp('^' + pattern.replace('*', '.*') + '$');
    for (const k of memStore.keys()) if (regex.test(k)) memStore.delete(k);
  },
};

// ── Redis (production) ──────────────────────────────────────
let redisClient = null;

async function getCache() {
  if (!USE_REDIS) return memCache;

  if (!redisClient) {
    const Redis = require('ioredis');
    redisClient = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });
    await redisClient.connect().catch(() => {
      console.warn('⚠️  Redis kết nối thất bại, dùng in-memory cache');
      redisClient = null;
      return memCache;
    });
    console.log('⚡  Redis cache ready');
  }

  return {
    async get(key) {
      const v = await redisClient.get(key);
      return v ? JSON.parse(v) : null;
    },
    async set(key, value, ttlSeconds = 60) {
      await redisClient.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    },
    async del(key) { await redisClient.del(key); },
    async delPattern(pattern) {
      const keys = await redisClient.keys(pattern);
      if (keys.length) await redisClient.del(...keys);
    },
  };
}

module.exports = { getCache };
