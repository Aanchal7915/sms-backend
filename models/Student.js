const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  address: { type: String },
  // reference to an authentication user (optional)
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  rollNumber: { type: String },
  // reference to Class model
  class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: false },

  // New Fields
  admissionDate: { type: Date },
  admissionNumber: { type: String, unique: true, sparse: true },
  aadharCard: { type: String, unique: true, sparse: true },
  fatherName: { type: String },
  // the class student was first assigned to when admitted
  originalClass: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: false },
  originalClassAssignedAt: { type: Date, required: false },
  reference: { type: String }, // optional
  profileImage: { type: String }, // Cloudinary URL
  dob: { type: Date },

  // QR token fields (optional)
  qrToken: { type: String, required: false },
  qrTokenIssuedAt: { type: Date, required: false },
  qrTokenExpires: { type: Date, required: false },
  createdAt: { type: Date, default: Date.now }
});

// Ensure roll numbers are unique per class (allow same rollNumber in different classes)
StudentSchema.index({ class: 1, rollNumber: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Student', StudentSchema);
