require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');

const User = require('./models/User');
const Product = require('./models/Product');
const Enquiry = require('./models/Enquiry');
const RealEstate = require('./models/RealEstate');
const Rate = require('./models/Rate');

const app = express();
const PORT = process.env.PORT || 5000;

// ================= CORS & MIDDLEWARE =================
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5000',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5000',
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app') || origin.endsWith('.onrender.com') || origin.includes('buildmitra')) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-User-Role', 'x-user-role']
}));

app.use(express.json());

// ================= MONGODB ATLAS SINGLE DATABASE CONNECTION =================
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

if (mongoUri) {
  mongoose.connect(mongoUri)
    .then(() => console.log('✅ MongoDB Atlas connected successfully'))
    .catch((err) => {
      console.error('❌ MongoDB Atlas Connection Failed:', err.message);
    });
} else {
  console.warn('⚠️ MONGODB_URI is not configured in environment variables.');
}

// ================= ROOT & HEALTH APIs =================
app.get('/', (req, res) => {
  res.send('🚀 BuildMitra Production Backend (MongoDB Atlas)');
});

app.get('/api/health', (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  res.json({
    status: isConnected ? 'OK' : 'DEGRADED',
    app: 'BuildMitra',
    database: isConnected ? 'MongoDB Atlas' : 'Disconnected',
    time: new Date()
  });
});

// ================= AUTH APIs =================
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;
    let user = await User.findOne({ $or: [{ email }, { phone }] });
    if (user) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }
    user = new User({ name, email: email || `${phone}@buildmitra.com`, phone, password, role: role || 'user' });
    await user.save();
    res.json({ success: true, user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, loginId, password } = req.body;
    const query = email ? { email } : { $or: [{ email: loginId }, { phone: loginId }] };
    const user = await User.findOne(query);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    res.json({ success: true, user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ================= MARKETPLACE APIs =================
app.get('/api/provider/marketplace-listings', async (req, res) => {
  try {
    const { category, search, city } = req.query;
    let filter = { status: 'active' };
    if (category) filter.category = category;
    if (city) filter.location = new RegExp(city, 'i');
    if (search) filter.name = new RegExp(search, 'i');
    const items = await Product.find(filter).limit(100);
    res.json({ success: true, listings: items, data: items });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find({ status: 'active' }).limit(100);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= REAL ESTATE APIs =================
app.get('/api/realestate', async (req, res) => {
  try {
    const properties = await RealEstate.find({ status: 'Approved' }).limit(100);
    res.json({ success: true, data: properties, properties });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ================= LIVE RATES APIs =================
app.get('/api/rates/approved', async (req, res) => {
  try {
    const rates = await Rate.find({});
    res.json({ success: true, rates });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/rates/ticker', async (req, res) => {
  try {
    const rates = await Rate.find({});
    res.json({ success: true, rates });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ================= ENQUIRY APIs =================
app.post('/api/enquiry', async (req, res) => {
  try {
    const enquiry = new Enquiry(req.body);
    await enquiry.save();
    res.json({ success: true, enquiry });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/enquiry/code/:code', async (req, res) => {
  try {
    const enquiry = await Enquiry.findOne({ enquiryCode: req.params.code });
    if (!enquiry) return res.status(404).json({ success: false, message: 'Enquiry not found' });
    res.json({ success: true, enquiry });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/enquiry/:id/quote', async (req, res) => {
  try {
    const enquiry = await Enquiry.findByIdAndUpdate(req.params.id, { ...req.body, status: 'Quoted' }, { new: true });
    res.json({ success: true, enquiry });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ================= START SERVER =================
app.listen(PORT, () => {
  console.log('\n===================================');
  console.log('🚀 BuildMitra Backend RUNNING (MongoDB Atlas)');
  console.log('===================================');
  console.log(`📍 Port: ${PORT}`);
  console.log(`💾 Database: MongoDB Atlas`);
  console.log('===================================\n');
});
