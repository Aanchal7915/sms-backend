const express = require('express');
const router = express.Router();
const Fee = require('../models/Fee');
const Student = require('../models/Student');
const auth = require('../middleware/auth');

// List fee transactions
router.get('/', auth, async (req, res) => {
  try {
    const fees = await Fee.find().sort({ paidAt: -1 }).populate('studentId', 'firstName lastName');
    res.json(fees);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

// Create a fee record (admin)
router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  try {
    const { studentId, amount, note } = req.body;
    // Basic validation
    if (!amount) return res.status(400).json({ message: 'Amount required' });
    const fee = new Fee({ studentId, amount, note });
    await fee.save();
    res.json(fee);
  } catch (err) { res.status(400).json({ message: 'Bad request', error: err.message }); }
});

// Summary total fees (simple)
router.get('/summary/total', auth, async (req, res) => {
  try {
    const result = await Fee.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const total = (result[0] && result[0].total) || 0;
    res.json({ total });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;
