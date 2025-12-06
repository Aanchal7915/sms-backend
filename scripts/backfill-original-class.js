// Run: node server/scripts/backfill-original-class.js
// This connects to the configured MongoDB, finds students with no originalClass
// and sets originalClass = class (if present) and originalClassAssignedAt to admissionDate || createdAt

const mongoose = require('mongoose');
const Student = require('../models/Student');
const config = require('../index');

async function main() {
  const mongoUrl = process.env.MONGODB_URI || process.env.MONGO_URL || 'mongodb://localhost:27017/sms';
  console.log('Connecting to', mongoUrl);
  await mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    const students = await Student.find({ originalClass: { $exists: false }, class: { $exists: true, $ne: null } });
    console.log('Found', students.length, 'students to backfill');
    for (const s of students) {
      s.originalClass = s.class;
      s.originalClassAssignedAt = s.admissionDate || s.createdAt || new Date();
      await s.save();
      console.log('Updated', s._id.toString());
    }
    console.log('Done');
  } catch (err) {
    console.error('Migration error', err);
  } finally {
    await mongoose.disconnect();
  }
}

main();
