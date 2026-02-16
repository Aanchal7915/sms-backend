const express = require('express');
const router = express.Router();
const Marksheet = require('../models/Marksheet');
const auth = require('../middleware/auth');

// Get all marksheets for admin
router.get('/', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
        const marksheets = await Marksheet.find().populate('studentId', 'firstName lastName rollNumber').sort({ createdAt: -1 });
        res.json(marksheets);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Get marksheets for a specific student (admin)
router.get('/student/:studentId', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
        const marksheets = await Marksheet.find({ studentId: req.params.studentId }).sort({ createdAt: -1 });
        res.json(marksheets);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Create marksheet (admin only)
router.post('/', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });

        const marksheet = new Marksheet(req.body);

        // Calculate totals if not provided
        if (!marksheet.totalMaxMarks || !marksheet.totalObtainedMarks) {
            marksheet.totalMaxMarks = marksheet.subjects.reduce((sum, s) => sum + s.maxMarks, 0);
            marksheet.totalObtainedMarks = marksheet.subjects.reduce((sum, s) => sum + s.obtainedMarks, 0);
        }

        // Calculate percentage
        if (marksheet.totalMaxMarks > 0) {
            marksheet.percentage = ((marksheet.totalObtainedMarks / marksheet.totalMaxMarks) * 100).toFixed(2);
        }

        // Determine result
        const failedSubject = marksheet.subjects.find(s => s.obtainedMarks < (s.maxMarks * 0.33));
        marksheet.result = failedSubject ? 'Fail' : 'Pass';

        await marksheet.save();
        res.json(marksheet);
    } catch (err) {
        console.error('Create marksheet error:', err);
        res.status(400).json({ message: 'Bad request', error: err.message });
    }
});

// Update marksheet
router.put('/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });

        const marksheet = await Marksheet.findById(req.params.id);
        if (!marksheet) return res.status(404).json({ message: 'Not found' });

        Object.assign(marksheet, req.body);

        // Recalculate totals
        marksheet.totalMaxMarks = marksheet.subjects.reduce((sum, s) => sum + s.maxMarks, 0);
        marksheet.totalObtainedMarks = marksheet.subjects.reduce((sum, s) => sum + s.obtainedMarks, 0);
        marksheet.percentage = ((marksheet.totalObtainedMarks / marksheet.totalMaxMarks) * 100).toFixed(2);

        const failedSubject = marksheet.subjects.find(s => s.obtainedMarks < (s.maxMarks * 0.33));
        marksheet.result = failedSubject ? 'Fail' : 'Pass';

        await marksheet.save();
        res.json(marksheet);
    } catch (err) {
        res.status(400).json({ message: 'Bad request', error: err.message });
    }
});

// Delete marksheet
router.delete('/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
        await Marksheet.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
