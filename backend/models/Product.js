const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  supplier: { type: String, required: true },
  location: { type: String },
  pincode: { type: String },
  price: { type: Number, required: true },
  unit: { type: String },
  ref_price: { type: Number },
  rating: { type: Number, default: 4.8 },
  gst: { type: Number, default: 18 },
  image_url: { type: String },
  status: { type: String, default: 'active' },
  listingCode: { type: String },
  providerUserCode: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', ProductSchema);
