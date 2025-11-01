const express = require('express');
const router = express.Router();
const ClassModel = require('../models/Class');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const auth = require('../middleware/auth');

// List classes
router.get('/', auth, async (req, res) => {
  try {
    const classes = await ClassModel.find().populate('teacher', 'firstName lastName').populate('students', 'firstName lastName');
    res.json(classes);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

// Get single class with populated students and teacher
router.get('/:id', auth, async (req, res) => {
  try {
    const c = await ClassModel.findById(req.params.id).populate('teacher', 'firstName lastName').populate('students', 'firstName lastName rollNumber');
    if (!c) return res.status(404).json({ message: 'Not found' });
    res.json(c);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

// Create class
router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Name required' });
    const exists = await ClassModel.findOne({ name });
    if (exists) return res.status(400).json({ message: 'Class with that name already exists' });
    const c = new ClassModel({ name });
    await c.save();
    res.json(c);
  } catch (err) { res.status(400).json({ message: 'Bad request', error: err.message }); }
});

// Update class: assign teacher and students
router.put('/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  try {
    const { teacherId, studentIds } = req.body; // studentIds: array
    const update = {};
    if (teacherId) {
      const t = await Teacher.findById(teacherId);
      if (!t) return res.status(400).json({ message: 'Invalid teacherId' });
      update.teacher = teacherId;
    }
    if (studentIds) {
      // validate student ids
      const students = await Student.find({ _id: { $in: studentIds } });
      if (students.length !== studentIds.length) return res.status(400).json({ message: 'One or more studentIds invalid' });
      update.students = studentIds;
    }
    const c = await ClassModel.findByIdAndUpdate(req.params.id, update, { new: true }).populate('teacher', 'firstName lastName').populate('students', 'firstName lastName');
    if (!c) return res.status(404).json({ message: 'Not found' });
    res.json(c);
  } catch (err) { res.status(400).json({ message: 'Bad request', error: err.message }); }
});

// Delete class
router.delete('/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  try {
    await ClassModel.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;
