const express = require('express');
const router = express.Router();
const {
  getStyleDashboard,
  getStyleRecommendations,
  getFavorites
} = require('../controllers/styleController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/dashboard', getStyleDashboard);
router.get('/recommendations', getStyleRecommendations);
router.get('/favorites', getFavorites);

module.exports = router;
