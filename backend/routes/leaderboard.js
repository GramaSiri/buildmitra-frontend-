const express = require('express');
const router = express.Router();
const Score = require('../models/Score');

router.get('/', async (req, res) => {
  try {
    const scores = await Score.find()
      .sort({ score: -1, date: -1 })
      .limit(50);
    
    const formatted = scores.map((s, index) => ({
      id: s._id,
      userName: s.userName,
      score: s.score,
      date: s.date,
      certificateId: s.certificateId,
      rank: index + 1
    }));
    
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/update', async (req, res) => {
  try {
    const { userId, userName, score, certificateId } = req.body;
    const scoreEntry = new Score({
      userId, userName, score,
      certificateId: score === 100 ? certificateId : null,
      certificateGenerated: score === 100
    });
    await scoreEntry.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
