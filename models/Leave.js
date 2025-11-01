const mongoose = require('mongoose');

const LeaveSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  from: { type: Date, required: true },
  to: { type: Date, required: true },
  reason: { type: String },
  status: { type: String, enum: ['pending','approved','rejected'], default: 'pending' },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Leave', LeaveSchema);
