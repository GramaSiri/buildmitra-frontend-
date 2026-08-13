const mongoose = require('mongoose');

const RealEstateSchema = new mongoose.Schema({
  propertyCode: { type: String, unique: true },
  title: { type: String, required: true },
  category: { type: String, default: 'Plot/Land' },
  location: { type: String },
  city: { type: String },
  pincode: { type: String },
  price: { type: Number },
  areaSqft: { type: Number },
  status: { type: String, default: 'Approved' },
  images: [{ type: String }],
  description: { type: String },
  contactPhone: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('RealEstate', RealEstateSchema);
