const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { authMiddleware, requireAdmin } = require('../middleware/auth');
const { listAttendance, createAttendance, attendanceSummary } = require('../controllers/attendanceController');

const router = express.Router();

router.get('/attendance', authMiddleware, asyncHandler(listAttendance));
router.post('/attendance', authMiddleware, requireAdmin, asyncHandler(createAttendance));
router.get('/attendance/:studentId/summary', authMiddleware, asyncHandler(attendanceSummary));

module.exports = router;
