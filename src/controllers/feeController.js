const { pool } = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response');

async function studentBelongsToTenant(studentId, tenantId) {
  const [rows] = await pool.execute(
    'SELECT student_id FROM students WHERE student_id = ? AND tenant_id = ? LIMIT 1',
    [studentId, tenantId]
  );
  return rows.length > 0;
}

async function listFees(req, res) {
  const studentId = Number(req.query.student_id || 0);

  if (studentId) {
    const exists = await studentBelongsToTenant(studentId, req.user.tenant_id);
    if (!exists) return sendError(res, 404, 'Student not found for this tenant');
  }

  const query = studentId
    ? 'SELECT fee_id, student_id, amount_paid, paid_at FROM fees WHERE tenant_id = ? AND student_id = ? ORDER BY fee_id DESC'
    : 'SELECT fee_id, student_id, amount_paid, paid_at FROM fees WHERE tenant_id = ? ORDER BY fee_id DESC';

  const [rows] = await pool.execute(query, studentId ? [req.user.tenant_id, studentId] : [req.user.tenant_id]);
  return sendSuccess(res, 200, 'Fees fetched successfully', rows);
}

async function createFee(req, res) {
  const { student_id, amount_paid } = req.body;

  if (!student_id || !amount_paid) {
    return sendError(res, 400, 'student_id and amount_paid are required');
  }

  const exists = await studentBelongsToTenant(Number(student_id), req.user.tenant_id);
  if (!exists) return sendError(res, 404, 'Student not found for this tenant');

  await pool.execute(
    'INSERT INTO fees (student_id, amount_paid, tenant_id) VALUES (?, ?, ?)',
    [Number(student_id), Number(amount_paid), req.user.tenant_id]
  );

  return sendSuccess(res, 201, 'Fee record added');
}

module.exports = { listFees, createFee };
