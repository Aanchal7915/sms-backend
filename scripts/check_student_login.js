const mongoose = require('mongoose');
const Student = require('../models/Student');
const User = require('../models/User');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const MONGO = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/school-db';

mongoose.connect(MONGO)
    .then(async () => {
        console.log('Connected to DB');

        // Find student with fitness data
        const student = await Student.findById('694a94885d693b7f5dc610dd');

        if (!student) {
            console.log('Student not found');
            process.exit();
        }

        console.log(`\nStudent: ${student.firstName} ${student.lastName}`);
        console.log(`Email: ${student.email}`);
        console.log(`UserId: ${student.userId}`);

        if (student.userId) {
            const user = await User.findById(student.userId);
            if (user) {
                console.log(`\nLinked User Found:`);
                console.log(`  Username: ${user.username}`);
                console.log(`  Role: ${user.role}`);
            } else {
                console.log('\nNo user found with this userId');
            }
        } else {
            console.log('\nStudent has no userId linked');
        }

        console.log(`\nPhysical Fitness Data:`);
        console.log(`  Height: ${student.height}`);
        console.log(`  Weight: ${student.weight}`);
        console.log(`  Blood Group: ${student.bloodGroup}`);
        console.log(`  Dental: ${student.dentalRecords}`);
        console.log(`  BP: ${student.bp}`);

        process.exit();
    })
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });
