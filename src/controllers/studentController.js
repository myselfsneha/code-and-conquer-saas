const { pool } = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response');

async function listStudents(req, res) {
  const search = String(req.query.search || '').trim();
  const course = String(req.query.course || '').trim();
  const year = req.query.year ? Number(req.query.year) : null;
  const page = Math.max(Number(req.query.page || 1), 1);
  const limit = Math.min(Math.max(Number(req.query.limit || 10), 1), 100);
  const offset = (page - 1) * limit;

  const where = ['s.tenant_id = ?'];
  const params = [req.user.tenant_id];

  if (search) {
    where.push('LOWER(s.name) LIKE ?');
    params.push(`%${search.toLowerCase()}%`);
  }

  if (course) {
    where.push('LOWER(s.course) = ?');
    params.push(course.toLowerCase());
  }

  if (year && Number.isInteger(year)) {
    where.push('s.year = ?');
    params.push(year);
  }

  const whereSql = `WHERE ${where.join(' AND ')}`;

  const [countRows] = await pool.execute(`SELECT COUNT(*) AS total FROM students s ${whereSql}`, params);
  const [rows] = await pool.execute(
    `SELECT
      s.student_id, s.name, s.email, s.course, s.year,
      COALESCE(f.total_paid, 0) AS total_paid,
      COALESCE(a.present_days, 0) AS present_days,
      COALESCE(a.total_days, 0) AS total_days,
      CASE WHEN COALESCE(a.total_days, 0) > 0
        THEN ROUND((a.present_days / a.total_days) * 100, 2)
        ELSE 0 END AS attendance_percentage
    FROM students s
    LEFT JOIN (
      SELECT tenant_id, student_id, SUM(amount_paid) AS total_paid
      FROM fees WHERE tenant_id = ? GROUP BY tenant_id, student_id
    ) f ON f.tenant_id = s.tenant_id AND f.student_id = s.student_id
    LEFT JOIN (
      SELECT tenant_id, student_id,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) AS present_days,
        COUNT(*) AS total_days
      FROM attendance WHERE tenant_id = ? GROUP BY tenant_id, student_id
    ) a ON a.tenant_id = s.tenant_id AND a.student_id = s.student_id
    ${whereSql}
    ORDER BY s.student_id DESC
    LIMIT ? OFFSET ?`,
    [req.user.tenant_id, req.user.tenant_id, ...params, limit, offset]
  );

  return sendSuccess(res, 200, 'Students fetched successfully', rows, {
    pagination: {
      total: countRows[0].total,
      page,
      limit,
      pages: Math.ceil(countRows[0].total / limit) || 1,
    },
  });
}

async function createStudent(req, res) {
  const { name, email, course, year } = req.body;

  if (!name || !email || !course || !year) {
    return sendError(res, 400, 'name, email, course and year are required');
  }

  try {
    const [result] = await pool.execute(
      'INSERT INTO students (name, email, course, year, tenant_id) VALUES (?, ?, ?, ?, ?)',
      [name, email, course, Number(year), req.user.tenant_id]
    );

    return sendSuccess(res, 201, 'Student added successfully', { student_id: result.insertId });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return sendError(res, 409, 'Student email already exists in this tenant');
    }
    throw error;
  }
}

async function deleteStudent(req, res) {
  const studentId = Number(req.params.id);
  if (!Number.isInteger(studentId) || studentId <= 0) {
    return sendError(res, 400, 'Invalid student id');
  }

  const [result] = await pool.execute(
    'DELETE FROM students WHERE student_id = ? AND tenant_id = ?',
    [studentId, req.user.tenant_id]
  );

  if (result.affectedRows === 0) {
    return sendError(res, 404, 'Student not found');
  }

  return sendSuccess(res, 200, 'Student deleted successfully');
}

module.exports = { listStudents, createStudent, deleteStudent };
