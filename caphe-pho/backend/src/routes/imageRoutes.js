const express = require('express');
const fetch = global.fetch || require('node-fetch');
const router = express.Router();

// Allowlist of hostnames we proxy (add more if needed)
const ALLOW_HOSTS = new Set([
  'images.unsplash.com',
  'i.imgur.com',
  'encrypted-tbn0.gstatic.com',
  'picsum.photos',
  'down-vn.img.susercontent.com',
  'cdn2.tuoitre.vn',
  'www.justonecookbook.com',
  'i.ytimg.com',
  'inkythuatso.com',
  'somewherecoffee.ca',
]);

router.get('/', async (req, res, next) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: 'Missing url' });
    let parsed;
    try { parsed = new URL(url); } catch (err) { return res.status(400).json({ error: 'Invalid url' }); }
    if (!ALLOW_HOSTS.has(parsed.hostname)) return res.status(403).json({ error: 'Host not allowed' });

    const response = await fetch(url);
    if (!response.ok) return res.status(502).json({ error: 'Upstream fetch failed' });

    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.set('Content-Type', contentType);
    res.set('Cache-Control', 'public, max-age=86400');
    return res.send(buffer);
  } catch (err) { next(err); }
});

module.exports = router;
