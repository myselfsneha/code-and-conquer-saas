const { pool } = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response');

async function studentBelongsToTenant(studentId, tenantId) {
  const [rows] = await pool.execute(
    'SELECT student_id FROM students WHERE student_id = ? AND tenant_id = ? LIMIT 1',
    [studentId, tenantId]
  );
  return rows.length > 0;
}

async function listAttendance(req, res) {
  const studentId = Number(req.query.student_id || 0);

  if (studentId) {
    const exists = await studentBelongsToTenant(studentId, req.user.tenant_id);
    if (!exists) return sendError(res, 404, 'Student not found for this tenant');
  }

  const query = studentId
    ? `SELECT attendance_id, student_id, status, date
       FROM attendance WHERE tenant_id = ? AND student_id = ?
       ORDER BY date DESC, attendance_id DESC`
    : `SELECT attendance_id, student_id, status, date
       FROM attendance WHERE tenant_id = ?
       ORDER BY date DESC, attendance_id DESC`;

  const [rows] = await pool.execute(query, studentId ? [req.user.tenant_id, studentId] : [req.user.tenant_id]);
  return sendSuccess(res, 200, 'Attendance fetched successfully', rows);
}

async function createAttendance(req, res) {
  const { student_id, status, date } = req.body;

  if (!student_id || !status || !date) {
    return sendError(res, 400, 'student_id, status and date are required');
  }

  if (!['present', 'absent'].includes(String(status).toLowerCase())) {
    return sendError(res, 400, 'status must be present or absent');
  }

  const exists = await studentBelongsToTenant(Number(student_id), req.user.tenant_id);
  if (!exists) return sendError(res, 404, 'Student not found for this tenant');

  await pool.execute(
    'INSERT INTO attendance (student_id, status, date, tenant_id) VALUES (?, ?, ?, ?)',
    [Number(student_id), String(status).toLowerCase(), date, req.user.tenant_id]
  );

  return sendSuccess(res, 201, 'Attendance marked successfully');
}

async function attendanceSummary(req, res) {
  const studentId = Number(req.params.studentId);
  if (!Number.isInteger(studentId) || studentId <= 0) {
    return sendError(res, 400, 'Invalid student id');
  }

  const exists = await studentBelongsToTenant(studentId, req.user.tenant_id);
  if (!exists) return sendError(res, 404, 'Student not found for this tenant');

  const [rows] = await pool.execute(
    `SELECT
      SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) AS present_days,
      COUNT(*) AS total_days
     FROM attendance
     WHERE tenant_id = ? AND student_id = ?`,
    [req.user.tenant_id, studentId]
  );

  const present = Number(rows[0].present_days || 0);
  const total = Number(rows[0].total_days || 0);

  return sendSuccess(res, 200, 'Attendance summary fetched successfully', {
    student_id: studentId,
    present_days: present,
    total_days: total,
    attendance_percentage: total > 0 ? Number(((present / total) * 100).toFixed(2)) : 0,
  });
}

module.exports = { listAttendance, createAttendance, attendanceSummary };
