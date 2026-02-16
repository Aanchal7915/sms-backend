const mongoose = require('mongoose');
const Student = require('../models/Student');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const MONGO = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/school-db';

mongoose.connect(MONGO)
    .then(async () => {
        const s = await Student.findOne({
            $or: [
                { firstName: { $regex: 'studenttest1', $options: 'i' } },
                { lastName: { $regex: 'studenttest1', $options: 'i' } },
                { email: { $regex: 'studenttest1', $options: 'i' } }
            ]
        });
        console.log('Found Student:', s);
        process.exit();
    })
    .catch(err => console.error(err));
