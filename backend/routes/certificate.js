const express = require('express');
const router = express.Router();
const Certificate = require('../models/Certificate');
const Score = require('../models/Score');

router.post('/generate', async (req, res) => {
  try {
    const { userId, userName, score } = req.body;
    if (score !== 100) {
      return res.status(400).json({ success: false, message: 'Certificate only for 100%' });
    }
    
    const certificateId = CERT-\-\;
    const certificate = new Certificate({ userId, userName, certificateId, score });
    await certificate.save();
    
    await Score.findOneAndUpdate(
      { userId, score: 100 },
      { certificateId, certificateGenerated: true },
      { sort: { date: -1 } }
    );
    
    res.json({ success: true, certificateId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:certificateId', async (req, res) => {
  try {
    const certificate = await Certificate.findOne({ certificateId: req.params.certificateId });
    if (!certificate) {
      return res.status(404).json({ success: false, message: 'Certificate not found' });
    }
    res.json({ success: true, certificate });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
