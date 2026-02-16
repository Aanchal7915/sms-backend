const express = require('express');
const router = express.Router();
const Marksheet = require('../models/Marksheet');
const Class = require('../models/Class');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');

// Get all marksheets for admin
router.get('/', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
        const query = {};
        if (req.query.studentId) query.studentId = req.query.studentId;
        const marksheets = await Marksheet.find(query).populate('studentId', 'firstName lastName rollNumber').sort({ createdAt: -1 });
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

        const data = { ...req.body };

        // Normalize class if it's an ID
        if (data.class && mongoose.Types.ObjectId.isValid(data.class)) {
            const cls = await Class.findById(data.class);
            if (cls) data.class = cls.name;
        }

        const marksheet = new Marksheet(data);

        // Filter out subjects with no name to avoid validation errors
        if (marksheet.subjects && Array.isArray(marksheet.subjects)) {
            marksheet.subjects = marksheet.subjects.filter(s => s.name && s.name.trim());
        }

        if (!marksheet.subjects || marksheet.subjects.length === 0) {
            return res.status(400).json({ message: 'At least one subject with a name is required' });
        }

        // Calculate totals
        marksheet.totalMaxMarks = marksheet.subjects.reduce((sum, s) => sum + (Number(s.maxMarks) || 0), 0);
        marksheet.totalObtainedMarks = marksheet.subjects.reduce((sum, s) => sum + (Number(s.obtainedMarks) || 0), 0);

        // Calculate percentage
        if (marksheet.totalMaxMarks > 0) {
            marksheet.percentage = ((marksheet.totalObtainedMarks / marksheet.totalMaxMarks) * 100).toFixed(2);
        }

        // Determine result
        const failedSubject = marksheet.subjects.find(s => Number(s.obtainedMarks) < (Number(s.maxMarks) * 0.33));
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

        const data = { ...req.body };
        // Normalize class if it's an ID
        if (data.class && mongoose.Types.ObjectId.isValid(data.class)) {
            const cls = await Class.findById(data.class);
            if (cls) data.class = cls.name;
        }

        Object.assign(marksheet, data);

        // Filter out subjects with no name
        if (marksheet.subjects && Array.isArray(marksheet.subjects)) {
            marksheet.subjects = marksheet.subjects.filter(s => s.name && s.name.trim());
        }

        if (marksheet.subjects.length === 0) {
            return res.status(400).json({ message: 'At least one subject with a name is required' });
        }

        // Recalculate totals
        marksheet.totalMaxMarks = marksheet.subjects.reduce((sum, s) => sum + (Number(s.maxMarks) || 0), 0);
        marksheet.totalObtainedMarks = marksheet.subjects.reduce((sum, s) => sum + (Number(s.obtainedMarks) || 0), 0);
        marksheet.percentage = ((marksheet.totalObtainedMarks / marksheet.totalMaxMarks) * 100).toFixed(2);

        const failedSubject = marksheet.subjects.find(s => Number(s.obtainedMarks) < (Number(s.maxMarks) * 0.33));
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
