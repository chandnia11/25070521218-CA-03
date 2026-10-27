const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const wardrobeRoutes = require('./routes/wardrobeRoutes');
const outfitRoutes = require('./routes/outfitRoutes');
const styleRoutes = require('./routes/styleRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Core Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/wardrobe', wardrobeRoutes);
app.use('/api/outfits', outfitRoutes);
app.use('/api/style', styleRoutes);

// Health / Status Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'StyleMuse API is running smoothly',
    timestamp: new Date().toISOString()
  });
});

// Root welcome route
app.get('/', (req, res) => {
  res.send('StyleMuse Backend API is active.');
});

// Start Server
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🌸 StyleMuse Server running on port ${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Auth Base URL: http://localhost:${PORT}/api/auth`);
  console.log(`👗 Wardrobe Base URL: http://localhost:${PORT}/api/wardrobe`);
  console.log(`✨ Outfits Base URL: http://localhost:${PORT}/api/outfits`);
  console.log(`💖 Style Base URL: http://localhost:${PORT}/api/style`);
  console.log(`===============================================`);
});
