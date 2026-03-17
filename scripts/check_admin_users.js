const mongoose = require('mongoose');
const User = require('../models/User');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const MONGO = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/school-db';

mongoose.connect(MONGO)
    .then(async () => {
        console.log('Connected to DB');

        const admins = await User.find({ role: 'admin' });
        console.log(`Found ${admins.length} admins:`);
        admins.forEach(a => {
            console.log(`- ${a.username} (Role: "${a.role}")`);
        });

        const allUsers = await User.find({}, 'username role');
        console.log(`Total users: ${allUsers.length}`);
        // Check if any user has a role that is NOT in the enum list or has distinct case
        allUsers.forEach(u => {
            if (!['admin', 'student', 'teacher', 'driver', 'bus-incharge'].includes(u.role)) {
                console.log(`WARNING: User ${u.username} has unusual role: "${u.role}"`);
            }
        });

        process.exit();
    })
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });
