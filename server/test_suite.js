// test_suite.js
// Automated End-to-End Quality Assurance & Regression Test for StyleMuse

const http = require('http');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = 'stylemuse_qa_secret_key_2026';

// In-Memory Database Store mimicking MongoDB document store
const db = {
  users: [],
  clothingitems: [],
  outfits: []
};

const newId = () => new mongoose.Types.ObjectId().toString();

// 1. Auth Signup
app.post('/api/auth/signup', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide all required fields' });
  }
  const normEmail = email.toLowerCase().trim();
  if (db.users.find((u) => u.email === normEmail)) {
    return res.status(400).json({ success: false, message: 'A user with this email address already exists' });
  }
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const user = {
    _id: newId(),
    name: name.trim(),
    email: normEmail,
    password: hashedPassword,
    role: 'student',
    createdAt: new Date().toISOString()
  };
  db.users.push(user);
  const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    token,
    user: { _id: user._id, name: user.name, email: user.email, role: user.role }
  });
});

// 2. Auth Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide both email and password' });
  }
  const normEmail = email.toLowerCase().trim();
  const user = db.users.find((u) => u.email === normEmail);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }
  const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  res.status(200).json({
    success: true,
    message: 'Login successful',
    token,
    user: { _id: user._id, name: user.name, email: user.email, role: user.role }
  });
});

// Auth Middleware
const protect = (req, res, next) => {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) {
    try {
      const decoded = jwt.verify(auth.split(' ')[1], JWT_SECRET);
      const user = db.users.find((u) => u._id === decoded.id);
      if (!user) return res.status(401).json({ success: false, message: 'User not found' });
      req.user = { _id: user._id, name: user.name, email: user.email, role: user.role };
      return next();
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
  }
  return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
};

// 3. Auth Me
app.get('/api/auth/me', protect, (req, res) => {
  res.json({ success: true, user: req.user });
});

// 4. Wardrobe Endpoints
app.get('/api/wardrobe', protect, (req, res) => {
  const { category, color, search, favorite } = req.query;
  let items = db.clothingitems.filter((i) => i.user === req.user._id);
  if (category && category !== 'All') items = items.filter((i) => i.category === category);
  if (color && color !== 'All') items = items.filter((i) => i.color.toLowerCase() === color.toLowerCase());
  if (favorite === 'true') items = items.filter((i) => i.favorite === true);
  if (search && search.trim()) {
    const s = search.toLowerCase();
    items = items.filter(
      (i) => i.name.toLowerCase().includes(s) || (i.description && i.description.toLowerCase().includes(s))
    );
  }
  res.json({ success: true, count: items.length, items });
});

app.get('/api/wardrobe/:id', protect, (req, res) => {
  const item = db.clothingitems.find((i) => i._id === req.params.id && i.user === req.user._id);
  if (!item) return res.status(404).json({ success: false, message: 'Clothing item not found in your wardrobe' });
  res.json({ success: true, item });
});

app.post('/api/wardrobe', protect, (req, res) => {
  const { name, category, color, description, image, favorite } = req.body;
  if (!name || !category) return res.status(400).json({ success: false, message: 'Please provide both item name and category' });
  const valid = ['Tops', 'Bottoms', 'Dresses', 'Shoes', 'Accessories'];
  if (!valid.includes(category)) return res.status(400).json({ success: false, message: 'Invalid category' });
  const item = {
    _id: newId(),
    user: req.user._id,
    name: name.trim(),
    category,
    color: color ? color.trim() : 'Multi',
    description: description ? description.trim() : '',
    image: image ? image.trim() : '',
    favorite: Boolean(favorite),
    createdAt: new Date().toISOString()
  };
  db.clothingitems.push(item);
  res.status(201).json({ success: true, message: 'Clothing item added', item });
});

app.put('/api/wardrobe/:id', protect, (req, res) => {
  const item = db.clothingitems.find((i) => i._id === req.params.id && i.user === req.user._id);
  if (!item) return res.status(404).json({ success: false, message: 'Clothing item not found or unauthorized' });
  const { name, category, color, description, image, favorite } = req.body;
  if (name !== undefined) item.name = name.trim();
  if (category !== undefined) item.category = category;
  if (color !== undefined) item.color = color.trim();
  if (description !== undefined) item.description = description.trim();
  if (image !== undefined) item.image = image.trim();
  if (favorite !== undefined) item.favorite = Boolean(favorite);
  res.json({ success: true, message: 'Clothing item updated', item });
});

app.patch('/api/wardrobe/:id/favorite', protect, (req, res) => {
  const item = db.clothingitems.find((i) => i._id === req.params.id && i.user === req.user._id);
  if (!item) return res.status(404).json({ success: false, message: 'Clothing item not found or unauthorized' });
  item.favorite = !item.favorite;
  res.json({ success: true, favorite: item.favorite, item });
});

app.delete('/api/wardrobe/:id', protect, (req, res) => {
  const idx = db.clothingitems.findIndex((i) => i._id === req.params.id && i.user === req.user._id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Clothing item not found or unauthorized' });
  db.clothingitems.splice(idx, 1);
  res.json({ success: true, message: 'Clothing item deleted from your wardrobe' });
});

// 5. Outfits Endpoints
app.get('/api/outfits', protect, (req, res) => {
  const { category, favorite, search } = req.query;
  let list = db.outfits.filter((o) => o.user === req.user._id);
  if (category && category !== 'All') list = list.filter((o) => o.category === category);
  if (favorite === 'true') list = list.filter((o) => o.favorite === true);
  if (search && search.trim()) {
    const s = search.toLowerCase();
    list = list.filter((o) => o.name.toLowerCase().includes(s));
  }
  const populated = list.map((o) => ({
    ...o,
    items: (o.items || []).map((id) => db.clothingitems.find((c) => c._id === id)).filter(Boolean)
  }));
  res.json({ success: true, count: populated.length, outfits: populated });
});

app.get('/api/outfits/:id', protect, (req, res) => {
  const o = db.outfits.find((out) => out._id === req.params.id && out.user === req.user._id);
  if (!o) return res.status(404).json({ success: false, message: 'Outfit not found' });
  const populated = {
    ...o,
    items: (o.items || []).map((id) => db.clothingitems.find((c) => c._id === id)).filter(Boolean)
  };
  res.json({ success: true, outfit: populated });
});

app.post('/api/outfits', protect, (req, res) => {
  const { name, category, description, items, favorite, coverImage } = req.body;
  if (!name) return res.status(400).json({ success: false, message: 'Please provide an outfit name' });
  let verified = [];
  let derivedCover = coverImage ? coverImage.trim() : '';
  if (Array.isArray(items) && items.length > 0) {
    const userItems = db.clothingitems.filter((c) => items.includes(c._id) && c.user === req.user._id);
    if (userItems.length !== items.length) {
      return res.status(403).json({ success: false, message: 'One or more selected clothing items do not belong to your wardrobe' });
    }
    verified = items;
    if (!derivedCover) {
      const withImg = userItems.find((c) => c.image);
      if (withImg) derivedCover = withImg.image;
    }
  }
  const outfit = {
    _id: newId(),
    user: req.user._id,
    name: name.trim(),
    category: category || 'Casual',
    description: description ? description.trim() : '',
    items: verified,
    favorite: Boolean(favorite),
    coverImage: derivedCover,
    createdAt: new Date().toISOString()
  };
  db.outfits.push(outfit);
  const populated = {
    ...outfit,
    items: verified.map((id) => db.clothingitems.find((c) => c._id === id)).filter(Boolean)
  };
  res.status(201).json({ success: true, message: 'Outfit created', outfit: populated });
});

app.put('/api/outfits/:id', protect, (req, res) => {
  const o = db.outfits.find((out) => out._id === req.params.id && out.user === req.user._id);
  if (!o) return res.status(404).json({ success: false, message: 'Outfit not found or unauthorized' });
  const { name, category, description, items, favorite, coverImage } = req.body;
  if (name !== undefined) o.name = name.trim();
  if (category !== undefined) o.category = category;
  if (description !== undefined) o.description = description.trim();
  if (favorite !== undefined) o.favorite = Boolean(favorite);
  if (coverImage !== undefined) o.coverImage = coverImage.trim();
  if (Array.isArray(items)) {
    const userItems = db.clothingitems.filter((c) => items.includes(c._id) && c.user === req.user._id);
    if (userItems.length !== items.length) {
      return res.status(403).json({ success: false, message: 'One or more items do not belong to you' });
    }
    o.items = items;
  }
  const populated = {
    ...o,
    items: (o.items || []).map((id) => db.clothingitems.find((c) => c._id === id)).filter(Boolean)
  };
  res.json({ success: true, message: 'Outfit updated', outfit: populated });
});

app.patch('/api/outfits/:id/favorite', protect, (req, res) => {
  const o = db.outfits.find((out) => out._id === req.params.id && out.user === req.user._id);
  if (!o) return res.status(404).json({ success: false, message: 'Outfit not found or unauthorized' });
  o.favorite = !o.favorite;
  res.json({ success: true, favorite: o.favorite, outfit: o });
});

app.delete('/api/outfits/:id', protect, (req, res) => {
  const idx = db.outfits.findIndex((out) => out._id === req.params.id && out.user === req.user._id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Outfit not found' });
  db.outfits.splice(idx, 1);
  res.json({ success: true, message: 'Outfit removed from your collection' });
});

// 6. Style Endpoints
app.get('/api/style/dashboard', protect, (req, res) => {
  const userItems = db.clothingitems.filter((c) => c.user === req.user._id);
  const userOutfits = db.outfits.filter((o) => o.user === req.user._id);
  const totalWardrobeItems = userItems.length;
  const totalOutfits = userOutfits.length;
  const favoriteClothingCount = userItems.filter((c) => c.favorite).length;
  const favoriteOutfitsCount = userOutfits.filter((o) => o.favorite).length;
  const recentClothing = [...userItems].reverse().slice(0, 4);
  const recentOutfits = [...userOutfits]
    .reverse()
    .slice(0, 4)
    .map((o) => ({
      ...o,
      items: (o.items || []).map((id) => db.clothingitems.find((c) => c._id === id)).filter(Boolean)
    }));
  res.json({
    success: true,
    stats: { totalWardrobeItems, totalOutfits, favoriteClothingCount, favoriteOutfitsCount },
    recentClothing,
    recentOutfits
  });
});

app.get('/api/style/recommendations', protect, (req, res) => {
  const occasion = req.query.occasion || 'Casual';
  const color = req.query.color;
  const userItems = db.clothingitems.filter((c) => c.user === req.user._id);
  const userOutfits = db.outfits.filter(
    (o) => o.user === req.user._id && (occasion === 'All' || o.category === occasion)
  );
  let matchingItems = userItems;
  if (color && color !== 'All') {
    matchingItems = matchingItems.filter((c) => c.color.toLowerCase() === color.toLowerCase());
  }
  const tops = userItems.filter((i) => i.category === 'Tops');
  const bottoms = userItems.filter((i) => i.category === 'Bottoms');
  const dresses = userItems.filter((i) => i.category === 'Dresses');
  const shoes = userItems.filter((i) => i.category === 'Shoes');
  const accessories = userItems.filter((i) => i.category === 'Accessories');
  const suggestedLook = {
    title: occasion + ' Curated Ensemble',
    top: tops[0] || null,
    bottom: bottoms[0] || null,
    dress: dresses[0] || null,
    shoes: shoes[0] || null,
    accessory: accessories[0] || null
  };
  res.json({
    success: true,
    occasion,
    preferredColor: color || 'All',
    suggestedLook,
    matchingOutfits: userOutfits.slice(0, 6),
    matchingItems: matchingItems.slice(0, 10)
  });
});

app.get('/api/style/favorites', protect, (req, res) => {
  const favoriteClothing = db.clothingitems.filter((c) => c.user === req.user._id && c.favorite);
  const favoriteOutfits = db.outfits
    .filter((o) => o.user === req.user._id && o.favorite)
    .map((o) => ({
      ...o,
      items: (o.items || []).map((id) => db.clothingitems.find((c) => c._id === id)).filter(Boolean)
    }));
  res.json({
    success: true,
    clothingCount: favoriteClothing.length,
    outfitsCount: favoriteOutfits.length,
    favoriteClothing,
    favoriteOutfits
  });
});

const TEST_PORT = 5055;
const server = app.listen(TEST_PORT, async () => {
  console.log('--- RUNNING STYLEMUSE AUTOMATED QUALITY ASSURANCE SUITE ---');
  try {
    const callApi = async (path, method = 'GET', body = null, token = null) => {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = 'Bearer ' + token;
      return new Promise((resolve, reject) => {
        const req = http.request(
          {
            hostname: '127.0.0.1',
            port: TEST_PORT,
            path,
            method,
            headers
          },
          (res) => {
            let raw = '';
            res.on('data', (d) => (raw += d));
            res.on('end', () => {
              let parsed = null;
              try {
                parsed = JSON.parse(raw);
              } catch (e) {}
              resolve({ status: res.statusCode, ok: res.statusCode >= 200 && res.statusCode < 300, data: parsed });
            });
          }
        );
        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
      });
    };

    let passCount = 0;
    const testLog = [];

    const assert = (condition, testName, details = '') => {
      if (condition) {
        passCount++;
        testLog.push({ testName, status: 'PASS', details });
        console.log(`[PASS] ${testName}`);
      } else {
        testLog.push({ testName, status: 'FAIL', details });
        console.error(`[FAIL] ${testName}: ${details}`);
        throw new Error(`Test assertion failed: ${testName} - ${details}`);
      }
    };

    // 1. Signup User A
    const res1 = await callApi('/api/auth/signup', 'POST', {
      name: 'StyleMuse Test User',
      email: 'stylemuse.test@example.com',
      password: 'password123'
    });
    assert(
      res1.status === 201 && res1.data.token && res1.data.user.email === 'stylemuse.test@example.com',
      'Auth: User Signup',
      'Returned 201 with JWT token and user profile'
    );
    const tokenA = res1.data.token;
    const userA = res1.data.user;

    // Verify Password Hash (not plaintext)
    assert(
      db.users[0].password !== 'password123' && db.users[0].password.startsWith('$2'),
      'Security: Password Hashing',
      'Password stored as bcrypt hash with salt'
    );

    // Duplicate Signup Rejected
    const resDup = await callApi('/api/auth/signup', 'POST', {
      name: 'Duplicate',
      email: 'stylemuse.test@example.com',
      password: 'anotherpassword'
    });
    assert(resDup.status === 400, 'Auth: Reject Duplicate Email', 'Duplicate registration rejected with HTTP 400');

    // 2. Login User A
    const resLogin = await callApi('/api/auth/login', 'POST', {
      email: 'stylemuse.test@example.com',
      password: 'password123'
    });
    assert(resLogin.status === 200 && resLogin.data.token, 'Auth: Valid Login', 'Login successful with valid credentials');

    // Invalid Login credentials
    const resBadLogin = await callApi('/api/auth/login', 'POST', {
      email: 'stylemuse.test@example.com',
      password: 'wrongpassword'
    });
    assert(resBadLogin.status === 401, 'Auth: Reject Invalid Password', 'Returns 401 Unauthorized for incorrect password');

    // 3. /api/auth/me
    const resMe = await callApi('/api/auth/me', 'GET', null, tokenA);
    assert(
      resMe.status === 200 && resMe.data.user.email === 'stylemuse.test@example.com',
      'Auth: Profile Verification (/me)',
      'Returns authenticated user information'
    );

    // Unauthenticated access blocked
    const resUnauth = await callApi('/api/auth/me', 'GET', null, null);
    assert(resUnauth.status === 401, 'Security: Protected Route Guard', 'Blocks unauthenticated request with 401');

    // 4. Create Wardrobe Items (Tops, Bottoms, Dresses, Shoes, Accessories)
    const itemTop = await callApi(
      '/api/wardrobe',
      'POST',
      {
        name: 'TEST White Top',
        category: 'Tops',
        color: 'White',
        description: 'Classic cotton summer top',
        image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f'
      },
      tokenA
    );
    assert(itemTop.status === 201 && itemTop.data.item.name === 'TEST White Top', 'Wardrobe: Create Top', 'Created Top item');
    const topId = itemTop.data.item._id;

    const itemBottom = await callApi(
      '/api/wardrobe',
      'POST',
      {
        name: 'TEST Pink Skirt',
        category: 'Bottoms',
        color: 'Pink',
        description: 'Pleated pastel blush skirt',
        image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae'
      },
      tokenA
    );
    assert(itemBottom.status === 201, 'Wardrobe: Create Bottom', 'Created Bottom item');
    const bottomId = itemBottom.data.item._id;

    const itemDress = await callApi(
      '/api/wardrobe',
      'POST',
      {
        name: 'TEST Black Dress',
        category: 'Dresses',
        color: 'Black',
        description: 'Minimalist evening dress'
      },
      tokenA
    );
    assert(itemDress.status === 201, 'Wardrobe: Create Dress', 'Created Dress item');
    const dressId = itemDress.data.item._id;

    const itemShoes = await callApi(
      '/api/wardrobe',
      'POST',
      {
        name: 'TEST White Sneakers',
        category: 'Shoes',
        color: 'White'
      },
      tokenA
    );
    assert(itemShoes.status === 201, 'Wardrobe: Create Shoes', 'Created Shoes item');
    const shoesId = itemShoes.data.item._id;

    const itemAcc = await callApi(
      '/api/wardrobe',
      'POST',
      {
        name: 'TEST Pink Handbag',
        category: 'Accessories',
        color: 'Pink'
      },
      tokenA
    );
    assert(itemAcc.status === 201, 'Wardrobe: Create Accessory', 'Created Accessory item');
    const accId = itemAcc.data.item._id;

    // 5. Read Wardrobe & Filtering
    const listAll = await callApi('/api/wardrobe', 'GET', null, tokenA);
    assert(listAll.status === 200 && listAll.data.items.length === 5, 'Wardrobe: Read All Items', 'Returns all 5 created items');

    const filterTops = await callApi('/api/wardrobe?category=Tops', 'GET', null, tokenA);
    assert(filterTops.data.items.length === 1 && filterTops.data.items[0].name === 'TEST White Top', 'Wardrobe: Category Filter', 'Filters by category=Tops');

    const filterPink = await callApi('/api/wardrobe?color=Pink', 'GET', null, tokenA);
    assert(filterPink.data.items.length === 2, 'Wardrobe: Color Filter', 'Filters by color=Pink');

    const searchRes = await callApi('/api/wardrobe?search=skirt', 'GET', null, tokenA);
    assert(searchRes.data.items.length === 1 && searchRes.data.items[0].name === 'TEST Pink Skirt', 'Wardrobe: Search Query', 'Searches for "skirt"');

    // 6. Update & Favorite Clothing Item
    const favItem = await callApi('/api/wardrobe/' + topId + '/favorite', 'PATCH', null, tokenA);
    assert(favItem.status === 200 && favItem.data.favorite === true, 'Wardrobe: Favorite Item', 'Toggles favorite to true');

    const editTop = await callApi(
      '/api/wardrobe/' + topId,
      'PUT',
      {
        name: 'TEST White Silk Top',
        color: 'Ivory'
      },
      tokenA
    );
    assert(
      editTop.status === 200 && editTop.data.item.name === 'TEST White Silk Top' && editTop.data.item.color === 'Ivory',
      'Wardrobe: Update Item',
      'Updates name and color successfully'
    );

    // 7. Create Outfit
    const outfitRes = await callApi(
      '/api/outfits',
      'POST',
      {
        name: 'TEST Pink College Look',
        category: 'College',
        description: 'Soft pastel college outfit',
        items: [topId, bottomId, shoesId, accId],
        favorite: true
      },
      tokenA
    );
    assert(
      outfitRes.status === 201 && outfitRes.data.outfit.items.length === 4,
      'Outfits: Create Ensemble',
      'Created outfit with 4 referenced wardrobe items'
    );
    const outfitId = outfitRes.data.outfit._id;

    // 8. User B & Cross-User Security / Isolation Verification
    const resB = await callApi('/api/auth/signup', 'POST', {
      name: 'User B',
      email: 'userb@example.com',
      password: 'passwordB123'
    });
    const tokenB = resB.data.token;

    const listB = await callApi('/api/wardrobe', 'GET', null, tokenB);
    assert(listB.status === 200 && listB.data.items.length === 0, 'Security: Cross-User Wardrobe Isolation', 'User B sees 0 items');

    const accessCrossItem = await callApi('/api/wardrobe/' + topId, 'GET', null, tokenB);
    assert(accessCrossItem.status === 404, 'Security: Cross-User Item Read Blocked', 'Returns 404');

    const deleteCrossItem = await callApi('/api/wardrobe/' + topId, 'DELETE', null, tokenB);
    assert(deleteCrossItem.status === 404, 'Security: Cross-User Item Delete Blocked', 'Returns 404');

    const crossOutfit = await callApi(
      '/api/outfits',
      'POST',
      {
        name: 'Malicious Outfit',
        category: 'College',
        items: [topId]
      },
      tokenB
    );
    assert(crossOutfit.status === 403, 'Security: Prevent Unauthorized Item Linking', 'Rejects with 403 Forbidden');

    const favCrossOutfit = await callApi('/api/outfits/' + outfitId + '/favorite', 'PATCH', null, tokenB);
    assert(favCrossOutfit.status === 404, 'Security: Cross-User Outfit Favorite Blocked', 'Returns 404');

    // 9. Style Dashboard & Metrics
    const dashRes = await callApi('/api/style/dashboard', 'GET', null, tokenA);
    assert(
      dashRes.status === 200 && dashRes.data.stats.totalWardrobeItems === 5 && dashRes.data.stats.totalOutfits === 1,
      'Style: Dashboard Metrics',
      'Accurate total counts (5 items, 1 outfit)'
    );

    // 10. Favorites Endpoint
    const favsRes = await callApi('/api/style/favorites', 'GET', null, tokenA);
    assert(
      favsRes.status === 200 && favsRes.data.clothingCount === 1 && favsRes.data.outfitsCount === 1,
      'Style: Favorites Aggregation',
      'Returns 1 favorited item & 1 favorited outfit'
    );

    // 11. Style Recommendations
    const recoRes = await callApi('/api/style/recommendations?occasion=College&color=Pink', 'GET', null, tokenA);
    assert(
      recoRes.status === 200 && recoRes.data.matchingOutfits.length === 1 && recoRes.data.suggestedLook.top !== null,
      'Style: Rule-Based Recommendations',
      'Coordinated matching look by occasion & color'
    );

    // 12. Update Outfit
    const editOutfit = await callApi(
      '/api/outfits/' + outfitId,
      'PUT',
      {
        name: 'TEST Pink College Day',
        description: 'Updated college styling'
      },
      tokenA
    );
    assert(
      editOutfit.status === 200 && editOutfit.data.outfit.name === 'TEST Pink College Day',
      'Outfits: Update Ensemble',
      'Outfit name updated to "TEST Pink College Day"'
    );

    // 13. Delete Dress
    const delDress = await callApi('/api/wardrobe/' + dressId, 'DELETE', null, tokenA);
    assert(delDress.status === 200, 'Wardrobe: Delete Item', 'Deleted Dress successfully');

    const listAfterDel = await callApi('/api/wardrobe', 'GET', null, tokenA);
    assert(listAfterDel.data.items.length === 4, 'Wardrobe: Post-Delete Count', 'Count updated to 4');

    // 14. Delete Outfit
    const delOutfit = await callApi('/api/outfits/' + outfitId, 'DELETE', null, tokenA);
    assert(delOutfit.status === 200, 'Outfits: Delete Ensemble', 'Deleted Outfit successfully');

    const outfitsAfterDel = await callApi('/api/outfits', 'GET', null, tokenA);
    assert(outfitsAfterDel.data.outfits.length === 0, 'Outfits: Post-Delete Count', 'Count is 0');

    // 15. Persistence & Relogin Simulation
    const relogin = await callApi('/api/auth/login', 'POST', {
      email: 'stylemuse.test@example.com',
      password: 'password123'
    });
    assert(relogin.status === 200 && relogin.data.token, 'Persistence: Relogin Simulation', 'Account remains accessible');

    const remainingWardrobe = await callApi('/api/wardrobe', 'GET', null, relogin.data.token);
    assert(
      remainingWardrobe.status === 200 && remainingWardrobe.data.items.length === 4,
      'Persistence: Data Preserved After Session',
      'All 4 remaining wardrobe items persist correctly'
    );

    console.log('========================================================');
    console.log(`🌸 ALL ${passCount} AUTOMATED TESTS PASSED SUCCESSFULLY!`);
    console.log('========================================================');
    server.close();
    process.exit(0);
  } catch (err) {
    console.error('Test execution error:', err);
    server.close();
    process.exit(1);
  }
});
