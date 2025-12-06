// Usage: node server/scripts/find-duplicate-rolls.js
// Connects to MongoDB and lists duplicate rollNumbers within the same class

const mongoose = require('mongoose');
const Student = require('../models/Student');

async function main() {
  const mongoUrl = process.env.MONGODB_URI || process.env.MONGO_URL || 'mongodb://localhost:27017/sms';
  console.log('Connecting to', mongoUrl);
  await mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    const agg = [
      { $match: { rollNumber: { $exists: true, $ne: null }, class: { $exists: true, $ne: null } } },
      { $group: { _id: { class: '$class', rollNumber: '$rollNumber' }, count: { $sum: 1 }, docs: { $push: '$_id' } } },
      { $match: { count: { $gt: 1 } } }
    ];

    const duplicates = await Student.aggregate(agg).limit(1000);
    if (!duplicates || duplicates.length === 0) {
      console.log('No duplicates found (rollNumber within same class).');
      return;
    }

    console.log('Found', duplicates.length, 'duplicate groups. Listing up to 1000 groups:');
    for (const d of duplicates) {
      console.log(`Class: ${d._id.class}, Roll: ${d._id.rollNumber}, Count: ${d.count}`);
      const students = await Student.find({ _id: { $in: d.docs } }).select('firstName lastName class rollNumber admissionNumber');
      students.forEach(s => console.log(`  - ${s._id} ${s.firstName || ''} ${s.lastName || ''} (Roll: ${s.rollNumber})`));
    }

    console.log('\nResolve duplicates by editing student records (assign unique roll numbers per class), then recreate the compound index.');
  } catch (err) {
    console.error('Error during duplicate search', err);
  } finally {
    await mongoose.disconnect();
  }
}

main();
