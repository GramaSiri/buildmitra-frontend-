const express = require('express');
const router = express.Router();

const guidelines = [
  { id: 'rera', title: 'RERA Guidelines', officialWebsite: 'https://rera.gov.in/' },
  { id: 'bda', title: 'BDA Rules', officialWebsite: 'https://bda.gov.in/' },
  { id: 'bmrda', title: 'BMRDA Regulations', officialWebsite: 'https://bmrda.karnataka.gov.in/' }
];

router.get('/', (req, res) => {
  res.json({ success: true, guidelines });
});

router.get('/:id', (req, res) => {
  const guideline = guidelines.find(g => g.id === req.params.id);
  if (!guideline) {
    return res.status(404).json({ success: false, message: 'Not found' });
  }
  res.json({ success: true, guideline });
});

module.exports = router;
