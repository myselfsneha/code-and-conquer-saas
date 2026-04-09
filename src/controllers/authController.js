const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const env = require('../config/env');
const { sendSuccess, sendError } = require('../utils/response');
const { normalizeRole } = require('../middleware/auth');

async function registerAdmin(req, res) {
  const { name, email, password, tenant_id, role } = req.body;

  if (!name || !email || !password || !tenant_id) {
    return sendError(res, 400, 'name, email, password and tenant_id are required');
  }

  const normalizedRole = normalizeRole(role || 'admin');
  if (!['admin', 'student'].includes(normalizedRole)) {
    return sendError(res, 400, 'role must be admin or student');
  }

  try {
    const [existing] = await pool.execute(
      'SELECT user_id FROM users WHERE email = ? AND tenant_id = ? LIMIT 1',
      [email, Number(tenant_id)]
    );

    if (existing.length > 0) {
      return sendError(res, 409, 'User already exists for this tenant');
    }

    const hash = await bcrypt.hash(password, env.BCRYPT_ROUNDS);
    await pool.execute(
      'INSERT INTO users (name, email, password, role, tenant_id) VALUES (?, ?, ?, ?, ?)',
      [name, email, hash, normalizedRole, Number(tenant_id)]
    );

    return sendSuccess(res, 201, 'User registered successfully');
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return sendError(res, 409, 'User with same email already exists in this tenant');
    }
    throw error;
  }
}

async function login(req, res) {
  const { email, password, role, tenant_id } = req.body;

  if (!email || !password) {
    return sendError(res, 400, 'email and password are required');
  }

  const requestedRole = normalizeRole(role);
  const tenantId = tenant_id ? Number(tenant_id) : null;

  if (tenant_id && (!Number.isInteger(tenantId) || tenantId <= 0)) {
    return sendError(res, 400, 'tenant_id must be a valid positive number');
  }

  let query = 'SELECT user_id, email, password, role, tenant_id FROM users WHERE email = ?';
  const params = [email];

  if (requestedRole) {
    query += ' AND role = ?';
    params.push(requestedRole);
  }

  if (tenantId) {
    query += ' AND tenant_id = ?';
    params.push(tenantId);
  }

  query += ' LIMIT 5';

  const [users] = await pool.execute(query, params);

  if (users.length === 0) {
    return sendError(res, 401, 'Invalid credentials');
  }

  if (!tenantId && users.length > 1) {
    return sendError(res, 400, 'Multiple tenant accounts found. Please provide tenant_id');
  }

  const user = users[0];
  const ok = await bcrypt.compare(password, user.password);

  if (!ok) {
    return sendError(res, 401, 'Invalid credentials');
  }

  const token = jwt.sign(
    { user_id: user.user_id, tenant_id: user.tenant_id, role: user.role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );

  return sendSuccess(res, 200, 'Login successful', {
    token,
    user: { user_id: user.user_id, tenant_id: user.tenant_id, role: user.role },
  });
}

module.exports = { registerAdmin, login };
