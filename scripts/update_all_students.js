const mongoose = require('mongoose');
const Student = require('../models/Student');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const MONGO = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/school-db';

mongoose.connect(MONGO)
    .then(async () => {
        console.log('Connected to DB');

        // Update ALL students with default fitness data
        const result = await Student.updateMany(
            {},
            {
                $set: {
                    height: '165cm',
                    weight: '55kg',
                    bloodGroup: 'A+',
                    dentalRecords: 'Good',
                    bp: '120/80'
                }
            }
        );

        console.log(`✅ Updated ${result.modifiedCount} students with default fitness data`);

        // Verify
        const students = await Student.find({}, 'firstName lastName height weight bloodGroup');
        console.log('\nAll students now have fitness data:');
        students.forEach(s => {
            console.log(`- ${s.firstName} ${s.lastName}: H=${s.height}, W=${s.weight}, BG=${s.bloodGroup}`);
        });

        process.exit();
    })
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });
