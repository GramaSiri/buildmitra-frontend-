const mongoose = require('mongoose');

const EnquirySchema = new mongoose.Schema({
  enquiryCode: {
    type: String,
    default: () => `ENQ-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`
  },
  batchCode: { type: String },
  itemName: { type: String, required: true },
  itemType: { type: String, default: 'material' },
  listingCode: { type: String },
  masterItemCode: { type: String },
  providerName: { type: String },
  providerPhone: { type: String },
  providerUserCode: { type: String },
  buyerName: { type: String, required: true },
  buyerPhone: { type: String, required: true },
  buyerUserCode: { type: String },
  location: { type: String },
  pincode: { type: String },
  quantity: { type: String },
  unit: { type: String },
  uploadedRate: { type: Number },
  status: { type: String, default: 'Pending' },
  specification: { type: String },
  message: { type: String },
  quotedRate: { type: Number },
  deliveryTime: { type: String },
  paymentTerms: { type: String },
  remarks: { type: String },
  createdAt: { type: Date, default: Date.now }
}, { strict: false });

module.exports = mongoose.models.Enquiry || mongoose.model('Enquiry', EnquirySchema);
