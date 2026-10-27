const mongoose = require('mongoose');
const ClothingItem = require('../models/ClothingItem');

/**
 * @desc    Get all wardrobe clothing items for the authenticated user
 * @route   GET /api/wardrobe
 * @access  Private
 * Query params: category, color, search, favorite
 */
const getWardrobeItems = async (req, res) => {
  try {
    const { category, color, search, favorite } = req.query;
    const query = { user: req.user._id };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (color && color !== 'All') {
      query.color = new RegExp(`^${color.trim()}$`, 'i');
    }

    if (favorite === 'true') {
      query.favorite = true;
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { color: searchRegex }
      ];
    }

    const items = await ClothingItem.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: items.length,
      items
    });
  } catch (error) {
    console.error('Error fetching wardrobe items:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving wardrobe items'
    });
  }
};

/**
 * @desc    Get single clothing item by ID (Must belong to authenticated user)
 * @route   GET /api/wardrobe/:id
 * @access  Private
 */
const getWardrobeItemById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid clothing item ID format'
      });
    }

    const item = await ClothingItem.findOne({ _id: id, user: req.user._id });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Clothing item not found in your wardrobe'
      });
    }

    return res.status(200).json({
      success: true,
      item
    });
  } catch (error) {
    console.error('Error fetching clothing item:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving clothing item'
    });
  }
};

/**
 * @desc    Add a new clothing item to wardrobe
 * @route   POST /api/wardrobe
 * @access  Private
 */
const createWardrobeItem = async (req, res) => {
  try {
    const { name, category, color, description, image, favorite } = req.body;

    if (!name || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both item name and category'
      });
    }

    const validCategories = ['Tops', 'Bottoms', 'Dresses', 'Shoes', 'Accessories'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Category must be one of: ${validCategories.join(', ')}`
      });
    }

    const newItem = await ClothingItem.create({
      user: req.user._id, // Enforce logged in user ownership
      name: name.trim(),
      category,
      color: color ? color.trim() : 'Multi',
      description: description ? description.trim() : '',
      image: image ? image.trim() : '',
      favorite: Boolean(favorite)
    });

    return res.status(201).json({
      success: true,
      message: 'Clothing item added to your wardrobe successfully',
      item: newItem
    });
  } catch (error) {
    console.error('Error creating wardrobe item:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error adding clothing item'
    });
  }
};

/**
 * @desc    Update a clothing item (Must belong to authenticated user)
 * @route   PUT /api/wardrobe/:id
 * @access  Private
 */
const updateWardrobeItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, color, description, image, favorite } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid clothing item ID format'
      });
    }

    const item = await ClothingItem.findOne({ _id: id, user: req.user._id });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Clothing item not found or unauthorized'
      });
    }

    if (name !== undefined) item.name = name.trim();
    if (category !== undefined) {
      const validCategories = ['Tops', 'Bottoms', 'Dresses', 'Shoes', 'Accessories'];
      if (!validCategories.includes(category)) {
        return res.status(400).json({
          success: false,
          message: `Category must be one of: ${validCategories.join(', ')}`
        });
      }
      item.category = category;
    }
    if (color !== undefined) item.color = color.trim();
    if (description !== undefined) item.description = description.trim();
    if (image !== undefined) item.image = image.trim();
    if (favorite !== undefined) item.favorite = Boolean(favorite);

    await item.save();

    return res.status(200).json({
      success: true,
      message: 'Clothing item updated successfully',
      item
    });
  } catch (error) {
    console.error('Error updating wardrobe item:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error updating clothing item'
    });
  }
};

/**
 * @desc    Toggle favorite on a clothing item
 * @route   PATCH /api/wardrobe/:id/favorite
 * @access  Private
 */
const toggleWardrobeFavorite = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid clothing item ID format'
      });
    }

    const item = await ClothingItem.findOne({ _id: id, user: req.user._id });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Clothing item not found or unauthorized'
      });
    }

    item.favorite = !item.favorite;
    await item.save();

    return res.status(200).json({
      success: true,
      message: item.favorite ? 'Added to favorites' : 'Removed from favorites',
      favorite: item.favorite,
      item
    });
  } catch (error) {
    console.error('Error toggling wardrobe item favorite:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error toggling favorite status'
    });
  }
};

/**
 * @desc    Delete a clothing item from wardrobe
 * @route   DELETE /api/wardrobe/:id
 * @access  Private
 */
const deleteWardrobeItem = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid clothing item ID format'
      });
    }

    const item = await ClothingItem.findOne({ _id: id, user: req.user._id });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Clothing item not found or unauthorized'
      });
    }

    await item.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Clothing item deleted from your wardrobe'
    });
  } catch (error) {
    console.error('Error deleting wardrobe item:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error deleting clothing item'
    });
  }
};

module.exports = {
  getWardrobeItems,
  getWardrobeItemById,
  createWardrobeItem,
  updateWardrobeItem,
  toggleWardrobeFavorite,
  deleteWardrobeItem
};
