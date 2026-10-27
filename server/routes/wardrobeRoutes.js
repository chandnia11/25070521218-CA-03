const express = require('express');
const router = express.Router();
const {
  getWardrobeItems,
  getWardrobeItemById,
  createWardrobeItem,
  updateWardrobeItem,
  toggleWardrobeFavorite,
  deleteWardrobeItem
} = require('../controllers/wardrobeController');
const { protect } = require('../middleware/authMiddleware');

// All wardrobe operations are private and require JWT authentication
router.use(protect);

router.route('/')
  .get(getWardrobeItems)
  .post(createWardrobeItem);

router.route('/:id')
  .get(getWardrobeItemById)
  .put(updateWardrobeItem)
  .delete(deleteWardrobeItem);

router.patch('/:id/favorite', toggleWardrobeFavorite);

module.exports = router;
