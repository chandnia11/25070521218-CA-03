const ClothingItem = require('../models/ClothingItem');
const Outfit = require('../models/Outfit');

/**
 * @desc    Get dashboard metrics, recently added wardrobe items, and outfits
 * @route   GET /api/style/dashboard
 * @access  Private
 */
const getStyleDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    const [
      totalWardrobeItems,
      totalOutfits,
      favoriteOutfitsCount,
      favoriteClothingCount,
      recentClothing,
      recentOutfits
    ] = await Promise.all([
      ClothingItem.countDocuments({ user: userId }),
      Outfit.countDocuments({ user: userId }),
      Outfit.countDocuments({ user: userId, favorite: true }),
      ClothingItem.countDocuments({ user: userId, favorite: true }),
      ClothingItem.find({ user: userId }).sort({ createdAt: -1 }).limit(4),
      Outfit.find({ user: userId }).populate('items').sort({ createdAt: -1 }).limit(4)
    ]);

    // Compute simple category distribution
    const categoryCounts = await ClothingItem.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalWardrobeItems,
        totalOutfits,
        favoriteOutfitsCount,
        favoriteClothingCount,
        categoryCounts
      },
      recentClothing,
      recentOutfits
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving dashboard data'
    });
  }
};

/**
 * @desc    Simple rule-based style recommendations based on occasion / color
 * @route   GET /api/style/recommendations
 * @access  Private
 * Query: occasion (Casual, College, Party, Formal, Traditional), color
 */
const getStyleRecommendations = async (req, res) => {
  try {
    const userId = req.user._id;
    const { occasion, color } = req.query;

    const selectedOccasion = occasion || 'Casual';

    // 1. Find user's saved outfits that match the selected occasion/category
    const outfitQuery = { user: userId };
    if (selectedOccasion !== 'All') {
      outfitQuery.category = selectedOccasion;
    }

    const matchingOutfits = await Outfit.find(outfitQuery)
      .populate('items')
      .sort({ favorite: -1, createdAt: -1 })
      .limit(6);

    // 2. Find wardrobe items matching the color or complementary items
    const clothingQuery = { user: userId };
    if (color && color !== 'All') {
      clothingQuery.color = new RegExp(`^${color.trim()}$`, 'i');
    }

    const matchingItems = await ClothingItem.find(clothingQuery)
      .sort({ favorite: -1, createdAt: -1 })
      .limit(10);

    // 3. Simple deterministic pairing suggestion:
    // Suggest one Top + one Bottom (or one Dress) + Shoes + Accessory from user's wardrobe
    const userAllItems = await ClothingItem.find({ user: userId });
    const tops = userAllItems.filter(i => i.category === 'Tops');
    const bottoms = userAllItems.filter(i => i.category === 'Bottoms');
    const dresses = userAllItems.filter(i => i.category === 'Dresses');
    const shoes = userAllItems.filter(i => i.category === 'Shoes');
    const accessories = userAllItems.filter(i => i.category === 'Accessories');

    const suggestedLook = {
      title: `${selectedOccasion} Curated Ensemble`,
      top: tops.length > 0 ? tops[0] : null,
      bottom: bottoms.length > 0 ? bottoms[0] : null,
      dress: dresses.length > 0 ? dresses[0] : null,
      shoes: shoes.length > 0 ? shoes[0] : null,
      accessory: accessories.length > 0 ? accessories[0] : null
    };

    return res.status(200).json({
      success: true,
      occasion: selectedOccasion,
      preferredColor: color || 'All',
      suggestedLook,
      matchingOutfits,
      matchingItems
    });
  } catch (error) {
    console.error('Error fetching style recommendations:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error generating style recommendations'
    });
  }
};

/**
 * @desc    Get all favorite items (clothing and outfits)
 * @route   GET /api/style/favorites
 * @access  Private
 */
const getFavorites = async (req, res) => {
  try {
    const userId = req.user._id;

    const [favoriteClothing, favoriteOutfits] = await Promise.all([
      ClothingItem.find({ user: userId, favorite: true }).sort({ createdAt: -1 }),
      Outfit.find({ user: userId, favorite: true }).populate('items').sort({ createdAt: -1 })
    ]);

    return res.status(200).json({
      success: true,
      clothingCount: favoriteClothing.length,
      outfitsCount: favoriteOutfits.length,
      favoriteClothing,
      favoriteOutfits
    });
  } catch (error) {
    console.error('Error fetching favorites:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving favorites'
    });
  }
};

module.exports = {
  getStyleDashboard,
  getStyleRecommendations,
  getFavorites
};
