const mongoose = require('mongoose');

const EnquirySchema = new mongoose.Schema({
  enquiryCode: { type: String, unique: true },
  itemName: { type: String, required: true },
  providerName: { type: String },
  providerPhone: { type: String },
  providerUserCode: { type: String },
  buyerName: { type: String, required: true },
  buyerPhone: { type: String, required: true },
  buyerUserCode: { type: String },
  location: { type: String },
  quantity: { type: String },
  unit: { type: String },
  uploadedRate: { type: Number },
  status: { type: String, default: 'Pending' },
  specification: { type: String },
  quotedRate: { type: Number },
  deliveryTime: { type: String },
  paymentTerms: { type: String },
  remarks: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Enquiry', EnquirySchema);
