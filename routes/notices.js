const express = require('express');
const router = express.Router();
const Notice = require('../models/Notice');
const auth = require('../middleware/auth');

// Get all notices (optionally filter by audience)
router.get('/', auth, async (req, res) => {
  try {
    const { audience } = req.query; // optional
    const query = {};
    if (audience) query.audience = audience;
    const notices = await Notice.find(query).sort({ createdAt: -1 }).populate('author', 'username');
    res.json(notices);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create notice (admin only)
router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  try {
    const { title, body, audience } = req.body;
    if (!title || !body) return res.status(400).json({ message: 'Title and body required' });
    const notice = new Notice({ title, body, audience, author: req.user.id });
    await notice.save();
    res.json(notice);
  } catch (err) {
    res.status(400).json({ message: 'Bad request', error: err.message });
  }
});

// Update notice (admin)
router.put('/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  try {
    const notice = await Notice.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!notice) return res.status(404).json({ message: 'Not found' });
    res.json(notice);
  } catch (err) {
    res.status(400).json({ message: 'Bad request', error: err.message });
  }
});

// Delete notice (admin)
router.delete('/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  try {
    await Notice.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
