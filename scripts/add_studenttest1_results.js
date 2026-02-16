const mongoose = require('mongoose');
const Student = require('../models/Student');
const Marksheet = require('../models/Marksheet');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const MONGO = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/school-db';

mongoose.connect(MONGO)
    .then(async () => {
        console.log('Connected to DB');

        // Find student "studenttest1"
        // Searching by firstName, lastName, or email
        let student = await Student.findOne({
            $or: [
                { firstName: { $regex: 'studenttest1', $options: 'i' } },
                { lastName: { $regex: 'studenttest1', $options: 'i' } },
                { email: { $regex: 'studenttest1', $options: 'i' } }
            ]
        });

        if (!student) {
            console.log('Student "studenttest1" not found. Creating a test student...');
            student = new Student({
                firstName: 'StudentTest1',
                lastName: 'User',
                email: 'studenttest1@example.com',
                admissionNumber: 'ST1001',
                admissionDate: new Date(),
                fatherName: 'Test Father',
                aadharCard: '123456789012',
                class: '10th', // Or create a class ID if needed, but string works for now based on schema loose typing or if schema allows
                rollNumber: '101',
                phone: '9999999999',
                address: 'Test Address',
                previousSchool: 'Previous School Name',
                previousClass: '9th',
                previousPercentage: '85%',
                tcNumber: 'TC123',
                tcDate: new Date('2023-04-01'),
                lastExamMarks: '450/500',
                lastExamPercentage: '90%',
                achievements: 'First Prize in Debate'
            });
            try {
                await student.save();
                console.log('Created student:', student.firstName);
            } catch (err) {
                console.error('Failed to create student:', err.message);
                process.exit(1);
            }
        } else {
            console.log(`Found student: ${student.firstName} ${student.lastName} (${student._id})`);
        }

        // Define 3 marksheets
        const marksheetsData = [
            {
                examType: 'Unit Test 1',
                academicYear: '2024-25',
                examDate: new Date('2024-07-15'),
                subjects: [
                    { name: 'Mathematics', maxMarks: 50, obtainedMarks: 42, grade: 'A' },
                    { name: 'Science', maxMarks: 50, obtainedMarks: 38, grade: 'B' },
                    { name: 'English', maxMarks: 50, obtainedMarks: 45, grade: 'A+' },
                    { name: 'Hindi', maxMarks: 50, obtainedMarks: 40, grade: 'A' },
                    { name: 'Social Science', maxMarks: 50, obtainedMarks: 35, grade: 'B' }
                ],
                remarks: 'Good start, keep improving.'
            },
            {
                examType: 'Half Yearly Examination',
                academicYear: '2024-25',
                examDate: new Date('2024-10-10'),
                subjects: [
                    { name: 'Mathematics', maxMarks: 100, obtainedMarks: 85, grade: 'A' },
                    { name: 'Science', maxMarks: 100, obtainedMarks: 72, grade: 'B' },
                    { name: 'English', maxMarks: 100, obtainedMarks: 88, grade: 'A+' },
                    { name: 'Hindi', maxMarks: 100, obtainedMarks: 78, grade: 'B+' },
                    { name: 'Social Science', maxMarks: 100, obtainedMarks: 82, grade: 'A' }
                ],
                remarks: 'Consistent performance.'
            },
            {
                examType: 'Annual Examination',
                academicYear: '2024-25',
                examDate: new Date('2025-03-05'),
                subjects: [
                    { name: 'Mathematics', maxMarks: 100, obtainedMarks: 95, grade: 'A+' },
                    { name: 'Science', maxMarks: 100, obtainedMarks: 90, grade: 'A+' },
                    { name: 'English', maxMarks: 100, obtainedMarks: 92, grade: 'A+' },
                    { name: 'Hindi', maxMarks: 100, obtainedMarks: 85, grade: 'A' },
                    { name: 'Social Science', maxMarks: 100, obtainedMarks: 88, grade: 'A+' }
                ],
                remarks: 'Excellent annual results!'
            }
        ];

        // Insert marksheets
        for (const data of marksheetsData) {
            const marksheet = new Marksheet({
                studentId: student._id,
                class: typeof student.class === 'string' ? student.class : '10th',
                ...data
            });

            // Calculate totals
            marksheet.totalMaxMarks = marksheet.subjects.reduce((sum, s) => sum + s.maxMarks, 0);
            marksheet.totalObtainedMarks = marksheet.subjects.reduce((sum, s) => sum + s.obtainedMarks, 0);
            if (marksheet.totalMaxMarks > 0) {
                marksheet.percentage = ((marksheet.totalObtainedMarks / marksheet.totalMaxMarks) * 100).toFixed(2);
            }

            // Determine result
            const failedSubject = marksheet.subjects.find(s => s.obtainedMarks < (s.maxMarks * 0.33));
            marksheet.result = failedSubject ? 'Fail' : 'Pass';

            // Calculate overall grade (simplified logic)
            const p = marksheet.percentage;
            if (p >= 90) marksheet.grade = 'A+';
            else if (p >= 80) marksheet.grade = 'A';
            else if (p >= 70) marksheet.grade = 'B+';
            else if (p >= 60) marksheet.grade = 'B';
            else if (p >= 50) marksheet.grade = 'C';
            else if (p >= 33) marksheet.grade = 'D';
            else marksheet.grade = 'F';

            await marksheet.save();
            console.log(`Added ${data.examType} for ${student.firstName}`);
        }

        console.log('\n✅ Successfully added 3 marksheets for studenttest1.');
        process.exit();
    })
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });
