const express = require("express");
const router = express.Router();
const LoginLog = require("../models/LoginLog");

// Save login activity
router.post("/log-login", async (req, res) => {
  try {
    const { userId, name, role, time, device } = req.body;

    const log = new LoginLog({
      userId,
      name,
      role,
      loginTime: time,
      deviceInfo: device,
      ip: req.ip
    });

    await log.save();

    res.json({ success: true, message: "CRM log saved" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;