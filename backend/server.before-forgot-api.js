require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// ================= MIDDLEWARE =================
app.use(cors());
app.use(express.json());

// ================= DATABASE =================
const db = new sqlite3.Database(
  path.join(__dirname, 'buildmitra.db'),
  (err) => {
    if (err) {
      console.error('❌ Database connection failed:', err.message);
    } else {
      console.log('✅ SQLite Database connected');
    }
  }
);

// ================= CREATE ALL TABLES =================
db.serialize(() => {

  // ---------- USERS TABLE (NEW) ----------
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT UNIQUE NOT NULL,
      email TEXT,
      role TEXT DEFAULT 'buyer',
      status TEXT DEFAULT 'pending',
      password TEXT,
      address TEXT,
      pincode TEXT,
      project_name TEXT,
      plot_size TEXT,
      floors TEXT,
      building_type TEXT,
      buyer_type TEXT,
      vendor_type TEXT,
      gst TEXT,
      msme TEXT,
      bank TEXT,
      registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      approved_at DATETIME
    )
  `);

  // ---------- EXISTING TABLES ----------
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      supplier TEXT NOT NULL,
      location TEXT,
      pincode TEXT,
      price REAL NOT NULL,
      unit TEXT,
      ref_price REAL,
      rating REAL,
      gst INTEGER,
      image_url TEXT,
      status TEXT DEFAULT 'active'
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS pincode_access (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pincode TEXT UNIQUE NOT NULL,
      city TEXT,
      is_active INTEGER DEFAULT 0
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS enquiries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      enquiry_id TEXT UNIQUE NOT NULL,
      product_name TEXT NOT NULL,
      supplier_name TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      location TEXT,
      quantity TEXT,
      specifications TEXT,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS vendor_rate_submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vendor_id INTEGER NOT NULL,
      category TEXT NOT NULL,
      item_name TEXT NOT NULL,
      unit TEXT NOT NULL,
      price REAL NOT NULL,
      submission_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'pending',
      admin_remarks TEXT,
      approved_at DATETIME,
      approved_by INTEGER
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS approved_rates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      item_name TEXT NOT NULL,
      unit TEXT NOT NULL,
      price REAL NOT NULL,
      source_submission_id INTEGER,
      effective_from DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME,
      UNIQUE(category, item_name)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS admin_notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT,
      message TEXT,
      reference_id INTEGER,
      is_read BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // ================= SAMPLE DATA (only if empty) =================
  db.get(`SELECT COUNT(*) as count FROM products`, (err, row) => {
    if (err) return console.error(err.message);
    if (row.count === 0) {
      const sampleProducts = [
        { name: 'Tile Fixing Labour', category: 'Tiles', supplier: 'Horizon Tiles & Flooring', location: 'Indiranagar', pincode: '560038', price: 28, unit: 'SFT', ref_price: 30, rating: 4.9, gst: 18 },
        { name: '20mm Blue Metal', category: 'Sand', supplier: 'BuildRight Contracts', location: 'Rajajinagar', pincode: '560010', price: 50, unit: 'CFT', ref_price: 50, rating: 4.6, gst: 5 },
        { name: 'River Sand / M-Sand', category: 'Sand', supplier: 'BuildRight Contracts', location: 'Rajajinagar', pincode: '560010', price: 55, unit: 'CFT', ref_price: 55, rating: 4.6, gst: 5 },
        { name: 'Vitrified Tile 600×600mm', category: 'Tiles', supplier: 'Suresh Kumar & Co.', location: 'Gandhi Nagar', pincode: '560032', price: 58, unit: 'SFT', ref_price: 55, rating: 4.8, gst: 18 },
        { name: 'TMT Bar 8mm Fe-500', category: 'Steel', supplier: 'Horizon Tiles & Flooring', location: 'Indiranagar', pincode: '560038', price: 62, unit: 'KG', ref_price: 68, rating: 4.9, gst: 18 }
      ];
      const stmt = db.prepare(`INSERT INTO products (name, category, supplier, location, pincode, price, unit, ref_price, rating, gst) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
      sampleProducts.forEach(p => stmt.run(p.name, p.category, p.supplier, p.location, p.pincode, p.price, p.unit, p.ref_price, p.rating, p.gst));
      stmt.finalize();
      console.log('✅ Sample products inserted');
    }
  });

  db.get(`SELECT COUNT(*) as count FROM pincode_access`, (err, row) => {
    if (err) return console.error(err.message);
    if (row.count === 0) {
      const pincodes = ['560001', '560002', '560003', '560010', '560032', '560038', '560058', '560099'];
      const stmt = db.prepare(`INSERT INTO pincode_access (pincode, is_active) VALUES (?, 1)`);
      pincodes.forEach(p => stmt.run(p));
      stmt.finalize();
      console.log('✅ Sample pincodes inserted');
    }
  });
});

console.log('✅ Database setup complete');

// ================= AUTHENTICATION MIDDLEWARE (STUBS) =================
// In a real app, use JWT. For simplicity, we'll use a header "X-User-Role" (set by frontend after login)
function authenticateVendor(req, res, next) {
  const role = req.headers['x-user-role'];
  if (role !== 'vendor') return res.status(401).json({ error: 'Vendor access required' });
  next();
}

function authenticateAdmin(req, res, next) {
  const role = req.headers['x-user-role'];
  if (role !== 'admin') return res.status(401).json({ error: 'Admin access required' });
  next();
}

// ================= ROOT ROUTE =================
app.get('/', (req, res) => {
  res.send('🚀 BuildMitra Backend Running Successfully');
});

// ================= HEALTH API =================
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', app: 'BuildMitra', database: 'SQLite', time: new Date() });
});

// ================= USER REGISTRATION (NEW) =================
app.post('/api/register', (req, res) => {
  const {
    name, phone, password, email, role,
    address, pincode, projectName, plotSize, floors, buildingType, buyerType,
    vendorType, gst, msme, bank
  } = req.body;

  if (!name || !phone || !password) {
    return res.status(400).json({ error: 'Name, phone and password are required' });
  }

  const finalRole = role || 'buyer';
  const stmt = db.prepare(`
    INSERT INTO users (
      name, phone, password, email, role, status,
      address, pincode, project_name, plot_size, floors, building_type, buyer_type,
      vendor_type, gst, msme, bank, registered_at
    ) VALUES (?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `);
  stmt.run(
    name, phone, password, email, finalRole,
    address || '', pincode || '', projectName || '', plotSize || '', floors || '', buildingType || '', buyerType || '',
    vendorType || '', gst || '', msme || '', bank || '',
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed: users.phone')) {
          return res.status(400).json({ error: 'Mobile number already registered' });
        }
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true, userId: this.lastID });
    }
  );
  stmt.finalize();
});

// ================= CHECK USER STATUS (for login) =================
app.get('/api/user/status', (req, res) => {
  const { phone } = req.query;
  if (!phone) return res.status(400).json({ error: 'Phone required' });
  db.get(`SELECT name, role, status, password FROM users WHERE phone = ?`, [phone], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.json({ status: 'not_found' });
    res.json({ status: row.status, name: row.name, role: row.role, password: row.password });
  });
});


// ================= USER LOGIN API =================
app.post('/api/login', (req, res) => {
  const { phone, email, password } = req.body || {};
  const loginId = phone || email;

  if (!loginId || !password) {
    return res.status(400).json({ success: false, error: 'Phone/email and password are required' });
  }

  db.get(
    `SELECT id, name, phone, email, role, status, password FROM users WHERE phone = ? OR email = ?`,
    [loginId, loginId],
    (err, user) => {
      if (err) return res.status(500).json({ success: false, error: err.message });
      if (!user) return res.status(401).json({ success: false, error: 'User not found in backend database. Please register once again.' });
      if (String(user.password) !== String(password)) return res.status(401).json({ success: false, error: 'Invalid password.' });

      if (user.status !== 'approved') {
        return res.status(403).json({
          success: false,
          error: user.status === 'pending' ? 'Your account is pending admin approval.' : 'Your account is not active.',
          status: user.status
        });
      }

      const prefixMap = { buyer:'BUY', supplier:'SUP', contractor:'CON', machinery:'MAC', labour:'LAB', realestate:'REA', admin:'ADM' };
      const uniqueCode = `${prefixMap[user.role] || 'USR'}-${String(user.id).padStart(4,'0')}`;

      res.json({
        success: true,
        message: 'Login successful',
        user: {
          userId: user.id,
          uniqueCode,
          name: user.name,
          phone: user.phone,
          email: user.email || '',
          role: user.role,
          status: user.status,
          location: 'Bengaluru'
        }
      });
    }
  );
});
// ================= ADMIN: GET PENDING USERS =================
app.get('/api/admin/users', authenticateAdmin, (req, res) => {
  const { status } = req.query;
  let sql = `SELECT id, name, phone, email, role, status, registered_at, address, pincode, project_name FROM users`;
  const params = [];
  if (status) {
    sql += ` WHERE status = ?`;
    params.push(status);
  }
  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// ================= ADMIN: UPDATE USER STATUS (APPROVE/REJECT) =================
app.put('/api/admin/users/:id/status', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  const approvedAt = status === 'approved' ? 'CURRENT_TIMESTAMP' : null;
  db.run(`UPDATE users SET status = ?, approved_at = ${approvedAt || 'NULL'} WHERE id = ?`, [status, id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true });
  });
});

// ================= EXISTING APIs (unchanged) =================
app.get('/api/products', (req, res) => {
  db.all(`SELECT * FROM products WHERE status = 'active'`, [], (err, rows) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true, count: rows.length, products: rows });
  });
});

app.post('/api/check-pincode', (req, res) => {
  const { pincode } = req.body;
  if (!pincode) return res.status(400).json({ success: false, message: 'Pincode required' });
  db.get(`SELECT * FROM pincode_access WHERE pincode = ? AND is_active = 1`, [pincode], (err, row) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    if (row) res.json({ success: true, allowed: true, city: row.city || 'Bengaluru' });
    else res.json({ success: false, allowed: false, message: 'This pincode area is coming soon' });
  });
});

app.post('/api/enquiry', (req, res) => {
  console.log('📧 Enquiry Received:', req.body);
  const { productName, supplierName, customerName, customerPhone, location, quantity, specifications } = req.body;
  if (!customerName || !customerPhone) return res.status(400).json({ success: false, message: 'Customer name and phone required' });
  const enquiryId = 'ENQ' + Date.now() + Math.floor(Math.random() * 1000);
  db.run(`INSERT INTO enquiries (enquiry_id, product_name, supplier_name, customer_name, customer_phone, location, quantity, specifications, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [enquiryId, productName || 'Unknown', supplierName || 'Unknown', customerName, customerPhone, location || '', quantity || '', specifications || '', 'pending'],
    function(err) {
      if (err) {
        console.error('❌ Enquiry save failed:', err.message);
        return res.status(500).json({ success: false, error: err.message });
      }
      console.log(`✅ Enquiry Saved: ${enquiryId}`);
      res.json({ success: true, enquiryId, message: 'Enquiry submitted successfully' });
    });
});

app.get('/api/enquiries', (req, res) => {
  db.all(`SELECT * FROM enquiries ORDER BY created_at DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true, count: rows.length, enquiries: rows });
  });
});

// ================= VENDOR RATE MANAGEMENT (using authenticated vendor from header) =================
// For demo, we'll take vendor_id from request body (since no real auth yet). You can improve later.
app.post('/api/vendor/submit-rate', (req, res) => {
  const { vendor_id, category, item_name, unit, price } = req.body;
  if (!vendor_id) return res.status(400).json({ error: 'vendor_id required' });
  db.run(`INSERT INTO vendor_rate_submissions (vendor_id, category, item_name, unit, price) VALUES (?, ?, ?, ?, ?)`,
    [vendor_id, category, item_name, unit, price],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      db.run(`INSERT INTO admin_notifications (type, message, reference_id) VALUES (?, ?, ?)`,
        ['new_rate_submission', `Vendor ${vendor_id} submitted rate for ${item_name}`, this.lastID]);
      res.json({ success: true, submissionId: this.lastID });
    });
});

const upload = multer({ dest: 'uploads/' });
app.post('/api/vendor/bulk-upload', upload.single('csv'), (req, res) => {
  const results = [];
  const vendor_id = req.body.vendor_id;
  if (!vendor_id) return res.status(400).json({ error: 'vendor_id required' });
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
      const stmt = db.prepare(`INSERT INTO vendor_rate_submissions (vendor_id, category, item_name, unit, price) VALUES (?, ?, ?, ?, ?)`);
      results.forEach(r => {
        stmt.run(vendor_id, r.category, r.item_name, r.unit, parseFloat(r.price));
      });
      stmt.finalize();
      fs.unlinkSync(req.file.path);
      res.json({ success: true, count: results.length });
    });
});

app.get('/api/admin/pending-rates', authenticateAdmin, (req, res) => {
  db.all(`SELECT vrs.*, u.name as vendor_name FROM vendor_rate_submissions vrs JOIN users u ON vrs.vendor_id = u.id WHERE vrs.status = 'pending' ORDER BY vrs.submission_date DESC`, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/admin/approve-rate/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const { status, remarks } = req.body;
  db.get(`SELECT * FROM vendor_rate_submissions WHERE id = ?`, [id], (err, submission) => {
    if (err || !submission) return res.status(404).json({ error: 'Not found' });
    if (status === 'approved') {
      db.run(`INSERT INTO approved_rates (category, item_name, unit, price, source_submission_id, updated_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP) ON CONFLICT(category, item_name) DO UPDATE SET price = excluded.price, updated_at = CURRENT_TIMESTAMP`,
        [submission.category, submission.item_name, submission.unit, submission.price, id]);
    }
    db.run(`UPDATE vendor_rate_submissions SET status = ?, admin_remarks = ?, approved_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [status, remarks || '', id]);
    res.json({ success: true });
  });
});

app.get('/api/rates/approved', (req, res) => {
  db.all(`SELECT category, item_name, unit, price FROM approved_rates`, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/rates/:category/:item_name', (req, res) => {
  const { category, item_name } = req.params;
  db.get(`SELECT price FROM approved_rates WHERE category = ? AND item_name = ?`, [category, item_name], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row || { price: null });
  });
});

// ================= START SERVER =================
app.listen(PORT, () => {
  console.log('\n===================================');
  console.log('🚀 BuildMitra Backend RUNNING');
  console.log('===================================');
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`💾 Database: buildmitra.db`);
  console.log('\n📊 Available APIs:\n');
  console.log('GET    /');
  console.log('GET    /api/health');
  console.log('POST   /api/register');
  console.log('GET    /api/user/status');
  console.log('GET    /api/admin/users?status=pending  (admin only)');
  console.log('PUT    /api/admin/users/:id/status      (admin only)');
  console.log('GET    /api/products');
  console.log('GET    /api/enquiries');
  console.log('POST   /api/enquiry');
  console.log('POST   /api/check-pincode');
  console.log('POST   /api/vendor/submit-rate    (vendor)');
  console.log('POST   /api/vendor/bulk-upload    (vendor)');
  console.log('GET    /api/admin/pending-rates   (admin only)');
  console.log('POST   /api/admin/approve-rate/:id (admin only)');
  console.log('GET    /api/rates/approved');
  console.log('GET    /api/rates/:category/:item_name');
  console.log('\n===================================\n');
});



