const mongoose = require('mongoose');

const TimetableSchema = new mongoose.Schema({
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  content: { type: String, required: true }, // could be URL or text (simple)
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Timetable', TimetableSchema);
