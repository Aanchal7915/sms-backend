const mongoose = require('mongoose');

const FeeSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  amount: { type: Number, required: true },
  paidAt: { type: Date, default: Date.now },
  note: { type: String }
});

module.exports = mongoose.model('Fee', FeeSchema);
