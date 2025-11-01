const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Fee = require('../models/Fee');
const auth = require('../middleware/auth');

// Basic overview for dashboard: counts and dummy metrics
router.get('/overview', auth, async (req, res) => {
  try {
    const students = await Student.countDocuments();
    const teachers = await Teacher.countDocuments();
    const feesAgg = await Fee.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]);
    const totalFees = (feesAgg[0] && feesAgg[0].total) || 0;

    // Dummy analytics cards
    const analytics = [
      { title: 'New Admissions (30d)', value: Math.floor(Math.random() * 50) },
      { title: 'Active Teachers', value: teachers },
      { title: 'Avg Fees / Student', value: students ? Math.round(totalFees / students) : 0 }
    ];

    res.json({ students, teachers, totalFees, analytics });
  } catch (err) { res.status(500).json({ message: 'Server error', error: err.message }); }
});

module.exports = router;
