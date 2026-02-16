const mongoose = require('mongoose');

const MarksheetSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    examType: { type: String, required: true }, // e.g., "Half Yearly", "Annual", "Unit Test 1"
    class: { type: String, required: true }, // e.g., "10th", "9th"
    academicYear: { type: String, required: true }, // e.g., "2023-24"
    examDate: { type: Date },

    // Subjects and marks
    subjects: [{
        name: { type: String, required: true }, // e.g., "Mathematics", "Science"
        maxMarks: { type: Number, required: true },
        obtainedMarks: { type: Number, required: true },
        grade: { type: String }, // e.g., "A+", "B"
    }],

    // Overall result
    totalMaxMarks: { type: Number },
    totalObtainedMarks: { type: Number },
    percentage: { type: Number },
    grade: { type: String },
    result: { type: String }, // "Pass", "Fail"

    remarks: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Marksheet', MarksheetSchema);
