const mongoose = require('mongoose');
const Outfit = require('../models/Outfit');
const ClothingItem = require('../models/ClothingItem');

/**
 * @desc    Get all outfits for the authenticated user
 * @route   GET /api/outfits
 * @access  Private
 * Query params: category, favorite, search
 */
const getOutfits = async (req, res) => {
  try {
    const { category, favorite, search } = req.query;
    const query = { user: req.user._id };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (favorite === 'true') {
      query.favorite = true;
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { description: searchRegex }
      ];
    }

    const outfits = await Outfit.find(query)
      .populate('items')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: outfits.length,
      outfits
    });
  } catch (error) {
    console.error('Error fetching outfits:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving outfits'
    });
  }
};

/**
 * @desc    Get single outfit by ID
 * @route   GET /api/outfits/:id
 * @access  Private
 */
const getOutfitById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid outfit ID format'
      });
    }

    const outfit = await Outfit.findOne({ _id: id, user: req.user._id })
      .populate('items');

    if (!outfit) {
      return res.status(404).json({
        success: false,
        message: 'Outfit not found in your collection'
      });
    }

    return res.status(200).json({
      success: true,
      outfit
    });
  } catch (error) {
    console.error('Error fetching outfit:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving outfit'
    });
  }
};

/**
 * @desc    Create a new outfit
 * @route   POST /api/outfits
 * @access  Private
 */
const createOutfit = async (req, res) => {
  try {
    const { name, category, description, items, favorite, coverImage } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an outfit name'
      });
    }

    // Ownership verification: If items are supplied, make sure EVERY item belongs to req.user._id
    let verifiedItemIds = [];
    let derivedCoverImage = coverImage ? coverImage.trim() : '';

    if (Array.isArray(items) && items.length > 0) {
      // Validate all IDs
      const invalidIds = items.filter(id => !mongoose.Types.ObjectId.isValid(id));
      if (invalidIds.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'One or more clothing item IDs are invalid'
        });
      }

      // Check ownership in DB
      const userItems = await ClothingItem.find({
        _id: { $in: items },
        user: req.user._id
      });

      if (userItems.length !== items.length) {
        return res.status(403).json({
          success: false,
          message: 'One or more selected clothing items do not belong to your wardrobe'
        });
      }

      verifiedItemIds = items;

      // If no coverImage was manually provided, use the first clothing item with an image
      if (!derivedCoverImage) {
        const itemWithImg = userItems.find(it => it.image && it.image.trim() !== '');
        if (itemWithImg) {
          derivedCoverImage = itemWithImg.image;
        }
      }
    }

    const newOutfit = await Outfit.create({
      user: req.user._id, // Enforce logged in user ownership
      name: name.trim(),
      category: category || 'Casual',
      description: description ? description.trim() : '',
      items: verifiedItemIds,
      favorite: Boolean(favorite),
      coverImage: derivedCoverImage
    });

    const populatedOutfit = await Outfit.findById(newOutfit._id).populate('items');

    return res.status(201).json({
      success: true,
      message: 'Outfit created and saved to your collection',
      outfit: populatedOutfit
    });
  } catch (error) {
    console.error('Error creating outfit:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error creating outfit'
    });
  }
};

/**
 * @desc    Update an outfit
 * @route   PUT /api/outfits/:id
 * @access  Private
 */
const updateOutfit = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, description, items, favorite, coverImage } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid outfit ID format'
      });
    }

    const outfit = await Outfit.findOne({ _id: id, user: req.user._id });

    if (!outfit) {
      return res.status(404).json({
        success: false,
        message: 'Outfit not found or unauthorized'
      });
    }

    if (name !== undefined) outfit.name = name.trim();
    if (category !== undefined) outfit.category = category;
    if (description !== undefined) outfit.description = description.trim();
    if (favorite !== undefined) outfit.favorite = Boolean(favorite);
    if (coverImage !== undefined) outfit.coverImage = coverImage.trim();

    if (items !== undefined && Array.isArray(items)) {
      const invalidIds = items.filter(itemId => !mongoose.Types.ObjectId.isValid(itemId));
      if (invalidIds.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'One or more clothing item IDs are invalid'
        });
      }

      // Check ownership
      const userItems = await ClothingItem.find({
        _id: { $in: items },
        user: req.user._id
      });

      if (userItems.length !== items.length) {
        return res.status(403).json({
          success: false,
          message: 'One or more selected clothing items do not belong to your wardrobe'
        });
      }

      outfit.items = items;

      if (!outfit.coverImage) {
        const itemWithImg = userItems.find(it => it.image && it.image.trim() !== '');
        if (itemWithImg) {
          outfit.coverImage = itemWithImg.image;
        }
      }
    }

    await outfit.save();
    const populated = await Outfit.findById(outfit._id).populate('items');

    return res.status(200).json({
      success: true,
      message: 'Outfit updated successfully',
      outfit: populated
    });
  } catch (error) {
    console.error('Error updating outfit:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error updating outfit'
    });
  }
};

/**
 * @desc    Toggle outfit favorite
 * @route   PATCH /api/outfits/:id/favorite
 * @access  Private
 */
const toggleOutfitFavorite = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid outfit ID format'
      });
    }

    const outfit = await Outfit.findOne({ _id: id, user: req.user._id });

    if (!outfit) {
      return res.status(404).json({
        success: false,
        message: 'Outfit not found or unauthorized'
      });
    }

    outfit.favorite = !outfit.favorite;
    await outfit.save();

    return res.status(200).json({
      success: true,
      message: outfit.favorite ? 'Outfit added to favorites' : 'Outfit removed from favorites',
      favorite: outfit.favorite,
      outfit
    });
  } catch (error) {
    console.error('Error toggling outfit favorite:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error toggling outfit favorite status'
    });
  }
};

/**
 * @desc    Delete an outfit
 * @route   DELETE /api/outfits/:id
 * @access  Private
 */
const deleteOutfit = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid outfit ID format'
      });
    }

    const outfit = await Outfit.findOne({ _id: id, user: req.user._id });

    if (!outfit) {
      return res.status(404).json({
        success: false,
        message: 'Outfit not found or unauthorized'
      });
    }

    await outfit.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Outfit removed from your collection'
    });
  } catch (error) {
    console.error('Error deleting outfit:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error deleting outfit'
    });
  }
};

module.exports = {
  getOutfits,
  getOutfitById,
  createOutfit,
  updateOutfit,
  toggleOutfitFavorite,
  deleteOutfit
};
