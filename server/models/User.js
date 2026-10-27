const mongoose = require('mongoose');

// Define User Schema for college academic project
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Please provide your email address'],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Please provide a password']
    },
    role: {
      type: String,
      enum: ['student', 'admin'],
      default: 'student'
    }
  },
  {
    timestamps: true // Automatically tracks createdAt and updatedAt
  }
);

module.exports = mongoose.model('User', userSchema);
