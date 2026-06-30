const mongoose = require('mongoose');

const CertificateSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: { type: String, required: true },
  certificateId: { type: String, required: true, unique: true },
  score: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  sentToEmail: { type: Boolean, default: false },
  sentToPhone: { type: Boolean, default: false }
});

module.exports = mongoose.model('Certificate', CertificateSchema);
