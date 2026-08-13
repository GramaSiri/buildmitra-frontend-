const mongoose = require('mongoose');

const RateSchema = new mongoose.Schema({
  category: { type: String, required: true },
  itemName: { type: String, required: true },
  unit: { type: String, required: true },
  price: { type: Number, required: true },
  effectiveFrom: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Rate', RateSchema);
