const mongoose = require('mongoose');
const Student = require('../models/Student');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const MONGO = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/school-db';

mongoose.connect(MONGO)
    .then(async () => {
        console.log('Connected to DB');

        // Find the first student
        const student = await Student.findOne();

        if (!student) {
            console.log('No students found in database');
            process.exit();
        }

        console.log(`\nTesting with student: ${student.firstName} ${student.lastName} (ID: ${student._id})`);
        console.log('Current fitness data:');
        console.log(`  Height: "${student.height}"`);
        console.log(`  Weight: "${student.weight}"`);
        console.log(`  Blood Group: "${student.bloodGroup}"`);
        console.log(`  Dental Records: "${student.dentalRecords}"`);
        console.log(`  BP: "${student.bp}"`);

        // Update with test data
        student.height = '168cm';
        student.weight = '56kg';
        student.bloodGroup = 'O+';
        student.dentalRecords = 'Accurate';
        student.bp = 'Normal';

        await student.save();
        console.log('\n✅ Updated student with test fitness data');

        // Fetch again to verify
        const updated = await Student.findById(student._id);
        console.log('\nVerifying saved data:');
        console.log(`  Height: "${updated.height}"`);
        console.log(`  Weight: "${updated.weight}"`);
        console.log(`  Blood Group: "${updated.bloodGroup}"`);
        console.log(`  Dental Records: "${updated.dentalRecords}"`);
        console.log(`  BP: "${updated.bp}"`);

        process.exit();
    })
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });
