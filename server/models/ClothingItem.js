const mongoose = require('mongoose');

// Define ClothingItem Schema for StyleMuse
const clothingItemSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required']
    },
    name: {
      type: String,
      required: [true, 'Please provide an item name'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Please select a clothing category'],
      enum: {
        values: ['Tops', 'Bottoms', 'Dresses', 'Shoes', 'Accessories'],
        message: '{VALUE} is not a valid clothing category'
      }
    },
    color: {
      type: String,
      trim: true,
      default: 'Multi'
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    image: {
      type: String,
      trim: true,
      default: ''
    },
    favorite: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Index to quickly query items belonging to a user
clothingItemSchema.index({ user: 1, category: 1 });
clothingItemSchema.index({ user: 1, favorite: 1 });

module.exports = mongoose.model('ClothingItem', clothingItemSchema);
