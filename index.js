// Last updated: 2026-02-17T00:20:50+05:30
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors({
  origin: [
    'https://sms-frotend.vercel.app',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    process.env.CLIENT_URL
  ].filter(Boolean), // Remove undefined if env var is not set
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

const PORT = process.env.PORT || 5001;
const MONGO = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/school-db';

mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Connected to MongoDB')
    try {
      // Ensure student indexes are in the expected state: remove old global rollNumber index
      // and create a compound unique index on { class, rollNumber }.
      const coll = mongoose.connection.db.collection('students');
      const indexes = await coll.indexes();
      const hasOldRollIndex = indexes.some(i => i.key && i.key.rollNumber === 1);
      if (hasOldRollIndex) {
        // find the exact index name
        const old = indexes.find(i => i.key && i.key.rollNumber === 1);
        const oldName = old.name || 'rollNumber_1';
        try {
          console.log('Dropping old index:', oldName);
          await coll.dropIndex(oldName);
        } catch (e) {
          console.warn('Failed dropping old rollNumber index:', e.message || e);
        }
      }

      // Create compound index (if not exists)
      const existsCompound = indexes.some(i => i.key && i.key.class === 1 && i.key.rollNumber === 1);
      if (!existsCompound) {
        try {
          console.log('Creating compound index {class:1, rollNumber:1} unique');
          await coll.createIndex({ class: 1, rollNumber: 1 }, { unique: true, sparse: true });
          console.log('Compound index created');
        } catch (e) {
          console.warn('Failed creating compound index:', e.message || e);
        }
      }
    } catch (err) {
      console.warn('Index check/create error:', err.message || err);
    }
  })
  .catch(err => console.error('Mongo connection error', err));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.get('/', (req, res) => res.json({ message: 'School API running' }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
// admin sub-routes for students, teachers, finance, reports
app.use('/api/admin/students', require('./routes/students'));
app.use('/api/admin/teachers', require('./routes/teachers'));
app.use('/api/admin/finance', require('./routes/finance'));
app.use('/api/admin/reports', require('./routes/reports'));
app.use('/api/admin/classes', require('./routes/classes'));
app.use('/api/admin/notices', require('./routes/notices'));
app.use('/api/admin/marksheets', require('./routes/marksheets'));
// Portal-level notices endpoints (for bell/unread/read)
app.use('/api/notices', require('./routes/portalNotices'));
app.use('/api/admin/routes', require('./routes/routes'));

// new admin routes for drivers and buses
app.use('/api/admin/drivers', require('./routes/drivers'));
app.use('/api/admin/buses', require('./routes/buses'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/teacher', require('./routes/teacherPortal'));
app.use('/api/student', require('./routes/studentPortal'));
// driver portal for logged-in drivers
app.use('/api/driver', require('./routes/driverPortal'));
app.use('/api/admin/bus-incharges', require('./routes/busIncharges'));
app.use('/api/bus-incharge', require('./routes/busInchargePortal'));
app.use('/api/leaves', require('./routes/leaves'));
// QR endpoints (generate, scan)
app.use('/api/qr', require('./routes/qr'));
app.use('/api/upload', require('./routes/upload'));

// Temporary debug routes (remove in production)
app.use('/api/debug', require('./routes/debug'));

app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
