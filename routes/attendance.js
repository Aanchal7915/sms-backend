const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Class = require('../models/Class');
const Student = require('../models/Student');
const auth = require('../middleware/auth');

// Get all attendance records for a class
router.get('/class/:classId', auth, async (req, res) => {
  try {
    const { classId } = req.params;
    const { startDate, endDate } = req.query;

    let query = { classId };
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const attendance = await Attendance.find(query)
      .populate('records.studentId', 'firstName lastName rollNumber')
      .sort({ date: -1 });

    res.json(attendance);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Mark attendance for a class
router.post('/', auth, async (req, res) => {
  try {
    const { classId, date, records } = req.body;

    // Check if attendance already exists for this class and date
    const existingAttendance = await Attendance.findOne({ 
      classId,
      date: new Date(date)
    });

    if (existingAttendance) {
      return res.status(400).json({ msg: 'Attendance already marked for this date' });
    }

    // Create new attendance record
    const attendance = new Attendance({
      classId,
      date: new Date(date),
      records
    });

    await attendance.save();
    
    // Populate student details before sending response
    const populatedAttendance = await Attendance.findById(attendance._id)
      .populate('records.studentId', 'firstName lastName rollNumber');

    res.json(populatedAttendance);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Update attendance record
router.put('/:id', auth, async (req, res) => {
  try {
    const { records } = req.body;
    const attendance = await Attendance.findById(req.params.id);

    if (!attendance) {
      return res.status(404).json({ msg: 'Attendance record not found' });
    }

    attendance.records = records;
    await attendance.save();

    const populatedAttendance = await Attendance.findById(attendance._id)
      .populate('records.studentId', 'firstName lastName rollNumber');

    res.json(populatedAttendance);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Delete attendance record
router.delete('/:id', auth, async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id);

    if (!attendance) {
      return res.status(404).json({ msg: 'Attendance record not found' });
    }

    await attendance.remove();
    res.json({ msg: 'Attendance record removed' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Get attendance report for a class
router.get('/report/:classId', auth, async (req, res) => {
  try {
    const { classId } = req.params;
    const { startDate, endDate } = req.query;

    // Get all students in the class
    const classData = await Class.findById(classId).populate('students');
    if (!classData) {
      return res.status(404).json({ msg: 'Class not found' });
    }

    // Get attendance records for the date range
    const attendanceRecords = await Attendance.find({
      classId,
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    });

    // Calculate attendance percentage for each student
    const report = classData.students.map(student => {
      const totalDays = attendanceRecords.length;
      const presentDays = attendanceRecords.reduce((acc, record) => {
        const studentRecord = record.records.find(r => 
          r.studentId.toString() === student._id.toString()
        );
        return acc + (studentRecord?.status === 'present' ? 1 : 0);
      }, 0);

      return {
        student: {
          _id: student._id,
          name: `${student.firstName || ''} ${student.lastName || ''}`.trim(),
          rollNo: student.rollNumber || ''
        },
        totalDays,
        presentDays,
        percentage: totalDays ? (presentDays / totalDays) * 100 : 0
      };
    });

    res.json(report);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;