const mongoose = require('mongoose');
const Student = require('../models/Student');
const Marksheet = require('../models/Marksheet');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const MONGO = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/school-db';

mongoose.connect(MONGO)
    .then(async () => {
        console.log('Connected to DB');

        // Get all students
        const students = await Student.find();

        if (students.length === 0) {
            console.log('No students found');
            process.exit();
        }

        console.log(`Found ${students.length} students. Adding marksheets...\n`);

        // Add 2 marksheets for each student
        for (const student of students) {
            // Half Yearly Exam
            const halfYearly = new Marksheet({
                studentId: student._id,
                examType: 'Half Yearly Examination',
                class: '10th',
                academicYear: '2023-24',
                examDate: new Date('2023-10-15'),
                subjects: [
                    { name: 'Mathematics', maxMarks: 100, obtainedMarks: 85, grade: 'A+' },
                    { name: 'Science', maxMarks: 100, obtainedMarks: 78, grade: 'A' },
                    { name: 'English', maxMarks: 100, obtainedMarks: 82, grade: 'A+' },
                    { name: 'Hindi', maxMarks: 100, obtainedMarks: 75, grade: 'A' },
                    { name: 'Social Science', maxMarks: 100, obtainedMarks: 88, grade: 'A+' }
                ],
                grade: 'A+',
                remarks: 'Excellent performance. Keep it up!'
            });

            // Calculate totals
            halfYearly.totalMaxMarks = halfYearly.subjects.reduce((sum, s) => sum + s.maxMarks, 0);
            halfYearly.totalObtainedMarks = halfYearly.subjects.reduce((sum, s) => sum + s.obtainedMarks, 0);
            halfYearly.percentage = ((halfYearly.totalObtainedMarks / halfYearly.totalMaxMarks) * 100).toFixed(2);
            halfYearly.result = 'Pass';

            await halfYearly.save();

            // Annual Exam
            const annual = new Marksheet({
                studentId: student._id,
                examType: 'Annual Examination',
                class: '10th',
                academicYear: '2023-24',
                examDate: new Date('2024-03-20'),
                subjects: [
                    { name: 'Mathematics', maxMarks: 100, obtainedMarks: 92, grade: 'A+' },
                    { name: 'Science', maxMarks: 100, obtainedMarks: 88, grade: 'A+' },
                    { name: 'English', maxMarks: 100, obtainedMarks: 85, grade: 'A+' },
                    { name: 'Hindi', maxMarks: 100, obtainedMarks: 80, grade: 'A' },
                    { name: 'Social Science', maxMarks: 100, obtainedMarks: 90, grade: 'A+' }
                ],
                grade: 'A+',
                remarks: 'Outstanding improvement. Excellent work!'
            });

            annual.totalMaxMarks = annual.subjects.reduce((sum, s) => sum + s.maxMarks, 0);
            annual.totalObtainedMarks = annual.subjects.reduce((sum, s) => sum + s.obtainedMarks, 0);
            annual.percentage = ((annual.totalObtainedMarks / annual.totalMaxMarks) * 100).toFixed(2);
            annual.result = 'Pass';

            await annual.save();

            console.log(`✅ Added 2 marksheets for ${student.firstName} ${student.lastName}`);
        }

        console.log('\n✅ All marksheets added successfully!');
        console.log('\nNow login as student and check the profile page to see marksheets.');

        process.exit();
    })
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });
