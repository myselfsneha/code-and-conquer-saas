const { pool } = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response');

async function listCourses(req, res) {
  const [rows] = await pool.execute(
    `SELECT c.course_id, c.name, c.duration, c.fees,
      COUNT(s.student_id) AS student_count
     FROM courses c
     LEFT JOIN students s ON s.course = c.name AND s.tenant_id = c.tenant_id
     WHERE c.tenant_id = ?
     GROUP BY c.course_id, c.name, c.duration, c.fees
     ORDER BY c.course_id DESC`,
    [req.user.tenant_id]
  );

  return sendSuccess(res, 200, 'Courses fetched successfully', rows);
}

async function createCourse(req, res) {
  const { name, duration, fees } = req.body;
  if (!name || !duration || fees === undefined || fees === null) {
    return sendError(res, 400, 'name, duration and fees are required');
  }

  try {
    await pool.execute(
      'INSERT INTO courses (name, duration, fees, tenant_id) VALUES (?, ?, ?, ?)',
      [name, duration, Number(fees), req.user.tenant_id]
    );

    return sendSuccess(res, 201, 'Course added successfully');
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return sendError(res, 409, 'Course already exists for this tenant');
    }
    throw error;
  }
}

async function deleteCourse(req, res) {
  const courseId = Number(req.params.id);
  if (!Number.isInteger(courseId) || courseId <= 0) {
    return sendError(res, 400, 'Invalid course id');
  }

  const [result] = await pool.execute(
    'DELETE FROM courses WHERE course_id = ? AND tenant_id = ?',
    [courseId, req.user.tenant_id]
  );

  if (result.affectedRows === 0) {
    return sendError(res, 404, 'Course not found');
  }

  return sendSuccess(res, 200, 'Course deleted successfully');
}

module.exports = { listCourses, createCourse, deleteCourse };
