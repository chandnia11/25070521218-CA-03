const mongoose = require('mongoose');

// Define Outfit Schema for StyleMuse
const outfitSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required']
    },
    name: {
      type: String,
      required: [true, 'Please provide an outfit name'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Please select an outfit category/occasion'],
      enum: {
        values: ['Casual', 'College', 'Party', 'Formal', 'Traditional', 'Other'],
        message: '{VALUE} is not a valid outfit category'
      },
      default: 'Casual'
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    items: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ClothingItem'
      }
    ],
    favorite: {
      type: Boolean,
      default: false
    },
    coverImage: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Indexes for rapid access by user and category
outfitSchema.index({ user: 1, category: 1 });
outfitSchema.index({ user: 1, favorite: 1 });

module.exports = mongoose.model('Outfit', outfitSchema);
