const express = require('express');
const router = express.Router();
const {
  getOutfits,
  getOutfitById,
  createOutfit,
  updateOutfit,
  toggleOutfitFavorite,
  deleteOutfit
} = require('../controllers/outfitController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getOutfits)
  .post(createOutfit);

router.route('/:id')
  .get(getOutfitById)
  .put(updateOutfit)
  .delete(deleteOutfit);

router.patch('/:id/favorite', toggleOutfitFavorite);

module.exports = router;
