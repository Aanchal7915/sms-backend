const mongoose = require('mongoose');
const Student = require('../models/Student');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const MONGO = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/school-db';

mongoose.connect(MONGO)
    .then(async () => {
        console.log('Connected to DB');

        // Update ALL students with test academic records data
        const result = await Student.updateMany(
            {},
            {
                $set: {
                    // Physical Fitness (already added)
                    height: '165cm',
                    weight: '55kg',
                    bloodGroup: 'A+',
                    dentalRecords: 'Good',
                    bp: '120/80',

                    // Academic Records (new)
                    previousSchool: 'Delhi Public School',
                    previousClass: '9th',
                    previousPercentage: '85%',
                    tcNumber: 'TC/2024/001',
                    tcDate: new Date('2024-03-15'),
                    lastExamMarks: '425/500',
                    lastExamPercentage: '85%',
                    achievements: 'Science Olympiad Gold Medal, Best Student Award 2023'
                }
            }
        );

        console.log(`✅ Updated ${result.modifiedCount} students with academic records data`);

        // Verify
        const students = await Student.find({}, 'firstName lastName previousSchool previousPercentage achievements');
        console.log('\nAll students now have academic records:');
        students.forEach(s => {
            console.log(`\n- ${s.firstName} ${s.lastName}:`);
            console.log(`  Previous School: ${s.previousSchool}`);
            console.log(`  Previous %: ${s.previousPercentage}`);
            console.log(`  Achievements: ${s.achievements}`);
        });

        process.exit();
    })
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });
