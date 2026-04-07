const express = require('express');
const cors = require('cors');
const path = require('path');
const env = require('./config/env');
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const courseRoutes = require('./routes/courseRoutes');
const feeRoutes = require('./routes/feeRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const healthRoutes = require('./routes/healthRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();

const allowedOrigins = env.CORS_ORIGIN.split(',').map((item) => item.trim()).filter(Boolean);

app.use(express.json({ limit: '1mb' }));
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error('CORS blocked'));
    },
    credentials: true,
  })
);

app.use(express.static(path.join(__dirname, '..', 'frontend')));

app.get('/', (req, res) => res.send('API Running ✅'));

app.use(healthRoutes);
app.use(authRoutes);
app.use(studentRoutes);
app.use(courseRoutes);
app.use(feeRoutes);
app.use(attendanceRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
