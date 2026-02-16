const mongoose = require('mongoose');
const Student = require('../models/Student');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const MONGO = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/school-db';

mongoose.connect(MONGO)
    .then(async () => {
        console.log('Connected to DB');

        // Check for students with any of the new fields
        const students = await Student.find({
            $or: [
                { height: { $exists: true, $ne: "" } },
                { weight: { $exists: true, $ne: "" } },
                { bloodGroup: { $exists: true, $ne: "" } },
                { dentalRecords: { $exists: true, $ne: "" } },
                { bp: { $exists: true, $ne: "" } }
            ]
        }).limit(10);

        if (students.length === 0) {
            console.log('No students found with physical fitness info populated.');
        } else {
            console.log(`Found ${students.length} students with some fitness info:`);
            students.forEach(s => {
                console.log(`Student: ${s.firstName} ${s.lastName} (ID: ${s._id})`);
                console.log(`  Height: "${s.height}"`);
                console.log(`  Weight: "${s.weight}"`);
                console.log(`  BloodGroup: "${s.bloodGroup}"`);
                console.log(`  Dental: "${s.dentalRecords}"`);
                console.log(`  BP: "${s.bp}"`);
            });
        }

        process.exit();
    })
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });
