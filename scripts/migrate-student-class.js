/**
 * Simple migration script to populate Student.class from Class.students array.
 * Run from /server: node scripts/migrate-student-class.js
 */
const mongoose = require('mongoose')
require('dotenv').config()

const MONGO = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/school-db'

async function run(){
  await mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
  console.log('Connected to MongoDB')
  const Class = require('../models/Class')
  const Student = require('../models/Student')

  const classes = await Class.find({}).select('students name')
  for(const cls of classes){
    console.log(`Processing class ${cls.name} (${cls._id}) with ${cls.students.length} students`)
    for(const sid of cls.students){
      try{
        await Student.findByIdAndUpdate(sid, { class: cls._id })
      }catch(err){ console.error('Failed update for', sid, err.message) }
    }
  }

  console.log('Migration complete')
  process.exit(0)
}

run().catch(err=>{ console.error(err); process.exit(1) })
