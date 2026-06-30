const mongoose = require('mongoose');

const ScoreSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: { type: String, required: true },
  score: { type: Number, required: true },
  correctAnswers: { type: Number, required: true },
  totalQuestions: { type: Number, default: 20 },
  timeTaken: { type: Number },
  date: { type: Date, default: Date.now },
  certificateId: { type: String },
  certificateGenerated: { type: Boolean, default: false }
});

module.exports = mongoose.model('Score', ScoreSchema);
