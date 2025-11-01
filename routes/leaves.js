const express = require('express');
const router = express.Router();
const Leave = require('../models/Leave');
const Student = require('../models/Student');
const auth = require('../middleware/auth');

// Create leave (student)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') return res.status(403).json({ message: 'Only students can apply for leave' });
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) return res.status(404).json({ message: 'Student profile not found' });
    const { from, to, reason } = req.body;
    if (!from || !to) return res.status(400).json({ message: 'from and to dates required' });
    const leave = new Leave({ studentId: student._id, from: new Date(from), to: new Date(to), reason });
    await leave.save();
    res.json(leave);
  } catch (err) { res.status(400).json({ message: 'Bad request', error: err.message }); }
});

// Student: list own leaves
router.get('/me', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') return res.status(403).json({ message: 'Forbidden' });
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) return res.status(404).json({ message: 'Student profile not found' });
    const leaves = await Leave.find({ studentId: student._id }).sort({ createdAt: -1 });
    res.json(leaves);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

// Admin/teacher: list all pending leaves (or filter)
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role === 'student') return res.status(403).json({ message: 'Forbidden' });
    const { status } = req.query;
    const q = {};
    if (status) q.status = status;
    const leaves = await Leave.find(q).populate('studentId', 'firstName lastName').sort({ createdAt: -1 });
    res.json(leaves);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

// Approve/reject leave (teacher/admin)
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'teacher') return res.status(403).json({ message: 'Forbidden' });
    const { status } = req.body;
    if (!['approved','rejected'].includes(status)) return res.status(400).json({ message: 'Invalid status' });
    const leave = await Leave.findById(req.params.id);
    if (!leave) return res.status(404).json({ message: 'Not found' });
    leave.status = status;
    leave.reviewedBy = req.user.id;
    leave.reviewedAt = new Date();
    await leave.save();
    res.json(leave);
  } catch (err) { res.status(400).json({ message: 'Bad request', error: err.message }); }
});

module.exports = router;
