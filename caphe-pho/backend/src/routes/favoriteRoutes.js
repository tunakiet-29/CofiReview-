const express = require('express');
const router  = express.Router();
const { requireAuth } = require('../middleware/auth');
const { listFavorites, addFavorite, removeFavorite } = require('../controllers/favoriteController');

/**
 * @swagger
 * tags:
 *   name: Favorites
 *   description: Danh sách quán yêu thích của user
 */
router.get('/', requireAuth, listFavorites);
router.post('/:cafeId', requireAuth, addFavorite);
router.delete('/:cafeId', requireAuth, removeFavorite);

module.exports = router;
