// Usage:
// node server/scripts/query-progress.js <classId> [examName] [subject] [date]
// Example:
// node server/scripts/query-progress.js 64a... "Mid-Term" "Mathematics" 2025-12-06

const mongoose = require('mongoose')
const Progress = require('../models/Progress')

async function main() {
  const args = process.argv.slice(2)
  if (args.length < 1) {
    console.log('Usage: node scripts/query-progress.js <classId> [examName] [subject] [date]')
    process.exit(1)
  }
  const [classId, examName, subject, date] = args
  const mongoUrl = process.env.MONGODB_URI || process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/school-db'
  console.log('Connecting to', mongoUrl)
  await mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })

  try {
    const query = { classId: mongoose.Types.ObjectId(classId) }
    if (examName) query.examName = examName
    if (subject) query.subject = subject
    if (date) {
      const startDate = new Date(date + 'T00:00:00.000Z')
      const endDate = new Date(date + 'T23:59:59.999Z')
      query.date = { $gte: startDate, $lte: endDate }
      console.log('Query date range:', startDate.toISOString(), '-', endDate.toISOString())
    }

    const count = await Progress.countDocuments(query)
    console.log('Matching progress documents:', count)
    if (count > 0) {
      const docs = await Progress.find(query).limit(50).populate('studentId', 'firstName lastName rollNumber admissionNumber')
      docs.forEach(d => {
        console.log('---')
        console.log('Student:', d.studentId ? `${d.studentId.firstName} ${d.studentId.lastName} (${d.studentId.rollNumber || d.studentId.admissionNumber || d.studentId._id})` : d.studentId)
        console.log('Exam:', d.examName, '| Subject:', d.subject, '| Date:', d.date.toISOString(), '| Marks:', d.marks, '| OutOf:', d.outOf, '| Absent:', d.absent)
        console.log('Remarks:', d.remarks)
      })
    }
  } catch (err) {
    console.error('Query error', err)
  } finally {
    await mongoose.disconnect()
  }
}

main()
