const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  date: { type: Date, required: true },
  records: [{
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    status: { type: String, enum: ['present', 'absent'], default: 'present' }
  }],
  createdAt: { type: Date, default: Date.now }
});

// Compound index to prevent duplicate attendance for same class/date
AttendanceSchema.index({ classId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);