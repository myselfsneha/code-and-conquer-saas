const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const path = require("path");

require("dotenv").config();

const app = express();

const PORT = Number(process.env.PORT || 3000);
const JWT_SECRET = process.env.JWT_SECRET || "change-me-in-env";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";
const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS || 10);

const ALLOWED_ORIGINS = (process.env.CORS_ORIGIN || "*")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);

const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
  queueLimit: 0,
});

app.use(express.json({ limit: "1mb" }));
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || ALLOWED_ORIGINS.includes("*") || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("CORS blocked"));
    },
    credentials: true,
  })
);

app.use(express.static(path.join(__dirname, "frontend")));

function sendError(res, statusCode, message) {
  return res.status(statusCode).json({ success: false, message });
}

function toPositiveInt(value, fallback) {
  const parsed = Number(value);
  if (Number.isInteger(parsed) && parsed > 0) {
    return parsed;
  }
  return fallback;
}

function normalizeRole(role) {
  if (!role) return "";
  const lowerRole = String(role).toLowerCase().trim();
  if (lowerRole === "college") return "admin";
  return lowerRole;
}

function canManageTenantData(role) {
  const normalized = normalizeRole(role);
  return normalized === "admin";
}

function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return sendError(res, 401, "Authorization token is required");
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = {
      user_id: decoded.user_id,
      tenant_id: decoded.tenant_id,
      role: normalizeRole(decoded.role),
      original_role: decoded.role,
    };

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return sendError(res, 401, "Token expired. Please login again");
    }

    return sendError(res, 401, "Invalid token");
  }
}

async function verifyStudentOwnership(studentId, tenantId) {
  const [students] = await db.execute(
    "SELECT student_id FROM students WHERE student_id = ? AND tenant_id = ? LIMIT 1",
    [studentId, tenantId]
  );
  return students.length > 0;
}

app.get("/api/health", async (req, res) => {
  try {
    await db.query("SELECT 1");
    return res.json({ success: true, message: "Server and DB are healthy" });
  } catch (error) {
    console.error("Health check failed:", error.message);
    return sendError(res, 500, "Database connection failed");
  }
});

app.post("/register-admin", async (req, res) => {
  const { name, email, password, tenant_id, role } = req.body;

  if (!name || !email || !password || !tenant_id) {
    return sendError(res, 400, "name, email, password and tenant_id are required");
  }

  const normalizedRole = normalizeRole(role || "admin");
  if (!["admin", "student"].includes(normalizedRole)) {
    return sendError(res, 400, "role must be admin or student");
  }

  try {
    const [existingUsers] = await db.execute(
      "SELECT user_id FROM users WHERE email = ? AND tenant_id = ? LIMIT 1",
      [email, tenant_id]
    );

    if (existingUsers.length > 0) {
      return sendError(res, 409, "User already exists for this tenant");
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    await db.execute(
      "INSERT INTO users (name, email, password, role, tenant_id) VALUES (?, ?, ?, ?, ?)",
      [name, email, passwordHash, normalizedRole, tenant_id]
    );

    return res.status(201).json({ success: true, message: "User registered successfully" });
  } catch (error) {
    console.error("register-admin error:", error.message);
    if (error && error.code === "ER_DUP_ENTRY") {
      return sendError(res, 409, "User with same email already exists in this tenant");
    }
    return sendError(res, 500, "Registration failed");
  }
});

app.post("/login", async (req, res) => {
  const { email, password, role, tenant_id } = req.body;

  if (!email || !password) {
    return sendError(res, 400, "email and password are required");
  }

  const requestedRole = normalizeRole(role);
  const tenantId = tenant_id ? Number(tenant_id) : null;

  if (tenant_id && (!Number.isInteger(tenantId) || tenantId <= 0)) {
    return sendError(res, 400, "tenant_id must be a valid positive number");
  }

  try {
    let query = "SELECT user_id, email, password, role, tenant_id FROM users WHERE email = ?";
    const params = [email];

    if (requestedRole) {
      query += " AND role = ?";
      params.push(requestedRole);
    }

    if (tenantId) {
      query += " AND tenant_id = ?";
      params.push(tenantId);
    }

    query += " LIMIT 5";

    const [users] = await db.execute(query, params);

    if (users.length === 0) {
      return sendError(res, 401, "Invalid credentials");
    }

    if (!tenantId && users.length > 1) {
      return sendError(res, 400, "Multiple tenant accounts found. Please provide tenant_id");
    }

    const user = users[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return sendError(res, 401, "Invalid credentials");
    }

    const token = jwt.sign(
      {
        user_id: user.user_id,
        tenant_id: user.tenant_id,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        user_id: user.user_id,
        tenant_id: user.tenant_id,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("login error:", error.message);
    return sendError(res, 500, "Login failed");
  }
});

app.get("/students", authMiddleware, async (req, res) => {
  const search = String(req.query.search || "").trim();
  const course = String(req.query.course || "").trim();
  const year = req.query.year ? Number(req.query.year) : null;
  const page = toPositiveInt(req.query.page, 1);
  const limit = Math.min(toPositiveInt(req.query.limit, 10), 100);
  const offset = (page - 1) * limit;

  const whereParts = ["s.tenant_id = ?"];
  const params = [req.user.tenant_id];

  if (search) {
    whereParts.push("LOWER(s.name) LIKE ?");
    params.push(`%${search.toLowerCase()}%`);
  }

  if (course) {
    whereParts.push("LOWER(s.course) = ?");
    params.push(course.toLowerCase());
  }

  if (year && Number.isInteger(year)) {
    whereParts.push("s.year = ?");
    params.push(year);
  }

  const whereSql = `WHERE ${whereParts.join(" AND ")}`;

  try {
    const [countRows] = await db.execute(
      `SELECT COUNT(*) AS total FROM students s ${whereSql}`,
      params
    );

    const [students] = await db.execute(
      `SELECT
          s.student_id,
          s.name,
          s.email,
          s.course,
          s.year,
          COALESCE(f.total_paid, 0) AS total_paid,
          COALESCE(a.present_days, 0) AS present_days,
          COALESCE(a.total_days, 0) AS total_days,
          CASE
            WHEN COALESCE(a.total_days, 0) > 0 THEN ROUND((a.present_days / a.total_days) * 100, 2)
            ELSE 0
          END AS attendance_percentage
       FROM students s
       LEFT JOIN (
         SELECT student_id, tenant_id, SUM(amount_paid) AS total_paid
         FROM fees
         WHERE tenant_id = ?
         GROUP BY tenant_id, student_id
       ) f ON f.student_id = s.student_id AND f.tenant_id = s.tenant_id
       LEFT JOIN (
         SELECT student_id, tenant_id,
           SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) AS present_days,
           COUNT(*) AS total_days
         FROM attendance
         WHERE tenant_id = ?
         GROUP BY tenant_id, student_id
       ) a ON a.student_id = s.student_id AND a.tenant_id = s.tenant_id
       ${whereSql}
       ORDER BY s.student_id DESC
       LIMIT ? OFFSET ?`,
      [req.user.tenant_id, req.user.tenant_id, ...params, limit, offset]
    );

    return res.json({
      success: true,
      data: students,
      pagination: {
        total: countRows[0].total,
        page,
        limit,
        pages: Math.ceil(countRows[0].total / limit) || 1,
      },
    });
  } catch (error) {
    console.error("get students error:", error.message);
    return sendError(res, 500, "Failed to fetch students");
  }
});

app.post("/students", authMiddleware, async (req, res) => {
  if (!canManageTenantData(req.user.role)) {
    return sendError(res, 403, "Only admin can add students");
  }

  const { name, email, course, year } = req.body;

  if (!name || !email || !course || !year) {
    return sendError(res, 400, "name, email, course and year are required");
  }

  try {
    const [result] = await db.execute(
      "INSERT INTO students (name, email, course, year, tenant_id) VALUES (?, ?, ?, ?, ?)",
      [name, email, course, Number(year), req.user.tenant_id]
    );

    return res.status(201).json({
      success: true,
      message: "Student added successfully",
      data: { student_id: result.insertId },
    });
  } catch (error) {
    console.error("add student error:", error.message);
    if (error && error.code === "ER_DUP_ENTRY") {
      return sendError(res, 409, "Student email already exists in this tenant");
    }
    return sendError(res, 500, "Failed to add student");
  }
});

app.delete("/students/:id", authMiddleware, async (req, res) => {
  if (!canManageTenantData(req.user.role)) {
    return sendError(res, 403, "Only admin can delete students");
  }

  const studentId = Number(req.params.id);
  if (!Number.isInteger(studentId) || studentId <= 0) {
    return sendError(res, 400, "Invalid student id");
  }

  try {
    const [result] = await db.execute(
      "DELETE FROM students WHERE student_id = ? AND tenant_id = ?",
      [studentId, req.user.tenant_id]
    );

    if (result.affectedRows === 0) {
      return sendError(res, 404, "Student not found");
    }

    return res.json({ success: true, message: "Student deleted successfully" });
  } catch (error) {
    console.error("delete student error:", error.message);
    return sendError(res, 500, "Failed to delete student");
  }
});

app.get("/courses", authMiddleware, async (req, res) => {
  try {
    const [courses] = await db.execute(
      `SELECT c.course_id, c.name, c.duration, c.fees,
          COUNT(s.student_id) AS student_count
       FROM courses c
       LEFT JOIN students s ON s.course = c.name AND s.tenant_id = c.tenant_id
       WHERE c.tenant_id = ?
       GROUP BY c.course_id, c.name, c.duration, c.fees
       ORDER BY c.course_id DESC`,
      [req.user.tenant_id]
    );

    return res.json({ success: true, data: courses });
  } catch (error) {
    console.error("get courses error:", error.message);
    return sendError(res, 500, "Failed to fetch courses");
  }
});

app.post("/courses", authMiddleware, async (req, res) => {
  if (!canManageTenantData(req.user.role)) {
    return sendError(res, 403, "Only admin can add courses");
  }

  const { name, duration, fees } = req.body;
  if (!name || !duration || fees === undefined || fees === null) {
    return sendError(res, 400, "name, duration and fees are required");
  }

  try {
    await db.execute(
      "INSERT INTO courses (name, duration, fees, tenant_id) VALUES (?, ?, ?, ?)",
      [name, duration, Number(fees), req.user.tenant_id]
    );
    return res.status(201).json({ success: true, message: "Course added successfully" });
  } catch (error) {
    console.error("add course error:", error.message);
    if (error && error.code === "ER_DUP_ENTRY") {
      return sendError(res, 409, "Course already exists for this tenant");
    }
    return sendError(res, 500, "Failed to add course");
  }
});

app.delete("/courses/:id", authMiddleware, async (req, res) => {
  if (!canManageTenantData(req.user.role)) {
    return sendError(res, 403, "Only admin can delete courses");
  }

  const courseId = Number(req.params.id);
  if (!Number.isInteger(courseId) || courseId <= 0) {
    return sendError(res, 400, "Invalid course id");
  }

  try {
    const [result] = await db.execute(
      "DELETE FROM courses WHERE course_id = ? AND tenant_id = ?",
      [courseId, req.user.tenant_id]
    );

    if (result.affectedRows === 0) {
      return sendError(res, 404, "Course not found");
    }

    return res.json({ success: true, message: "Course deleted successfully" });
  } catch (error) {
    console.error("delete course error:", error.message);
    return sendError(res, 500, "Failed to delete course");
  }
});

app.get("/fees", authMiddleware, async (req, res) => {
  const studentId = Number(req.query.student_id || 0);

  if (studentId) {
    const belongs = await verifyStudentOwnership(studentId, req.user.tenant_id);
    if (!belongs) {
      return sendError(res, 404, "Student not found for this tenant");
    }
  }

  try {
    const query = studentId
      ? "SELECT fee_id, student_id, amount_paid, paid_at FROM fees WHERE tenant_id = ? AND student_id = ? ORDER BY fee_id DESC"
      : "SELECT fee_id, student_id, amount_paid, paid_at FROM fees WHERE tenant_id = ? ORDER BY fee_id DESC";

    const [rows] = await db.execute(query, studentId ? [req.user.tenant_id, studentId] : [req.user.tenant_id]);
    return res.json({ success: true, data: rows });
  } catch (error) {
    console.error("get fees error:", error.message);
    return sendError(res, 500, "Failed to fetch fees");
  }
});

app.post("/fees", authMiddleware, async (req, res) => {
  if (!canManageTenantData(req.user.role)) {
    return sendError(res, 403, "Only admin can add fee records");
  }

  const { student_id, amount_paid } = req.body;

  if (!student_id || !amount_paid) {
    return sendError(res, 400, "student_id and amount_paid are required");
  }

  try {
    const belongs = await verifyStudentOwnership(Number(student_id), req.user.tenant_id);
    if (!belongs) {
      return sendError(res, 404, "Student not found for this tenant");
    }

    await db.execute(
      "INSERT INTO fees (student_id, amount_paid, tenant_id) VALUES (?, ?, ?)",
      [Number(student_id), Number(amount_paid), req.user.tenant_id]
    );

    return res.status(201).json({ success: true, message: "Fee record added" });
  } catch (error) {
    console.error("add fee error:", error.message);
    return sendError(res, 500, "Failed to add fee record");
  }
});

app.get("/attendance", authMiddleware, async (req, res) => {
  const studentId = Number(req.query.student_id || 0);

  if (studentId) {
    const belongs = await verifyStudentOwnership(studentId, req.user.tenant_id);
    if (!belongs) {
      return sendError(res, 404, "Student not found for this tenant");
    }
  }

  try {
    const query = studentId
      ? `SELECT attendance_id, student_id, status, date
         FROM attendance
         WHERE tenant_id = ? AND student_id = ?
         ORDER BY date DESC, attendance_id DESC`
      : `SELECT attendance_id, student_id, status, date
         FROM attendance
         WHERE tenant_id = ?
         ORDER BY date DESC, attendance_id DESC`;

    const [rows] = await db.execute(query, studentId ? [req.user.tenant_id, studentId] : [req.user.tenant_id]);

    return res.json({ success: true, data: rows });
  } catch (error) {
    console.error("get attendance error:", error.message);
    return sendError(res, 500, "Failed to fetch attendance");
  }
});

app.post("/attendance", authMiddleware, async (req, res) => {
  if (!canManageTenantData(req.user.role)) {
    return sendError(res, 403, "Only admin can mark attendance");
  }

  const { student_id, status, date } = req.body;

  if (!student_id || !status || !date) {
    return sendError(res, 400, "student_id, status and date are required");
  }

  if (!["present", "absent"].includes(String(status).toLowerCase())) {
    return sendError(res, 400, "status must be present or absent");
  }

  try {
    const belongs = await verifyStudentOwnership(Number(student_id), req.user.tenant_id);
    if (!belongs) {
      return sendError(res, 404, "Student not found for this tenant");
    }

    await db.execute(
      "INSERT INTO attendance (student_id, status, date, tenant_id) VALUES (?, ?, ?, ?)",
      [Number(student_id), String(status).toLowerCase(), date, req.user.tenant_id]
    );

    return res.status(201).json({ success: true, message: "Attendance marked successfully" });
  } catch (error) {
    console.error("add attendance error:", error.message);
    return sendError(res, 500, "Failed to mark attendance");
  }
});

app.get("/attendance/:studentId/summary", authMiddleware, async (req, res) => {
  const studentId = Number(req.params.studentId);
  if (!Number.isInteger(studentId) || studentId <= 0) {
    return sendError(res, 400, "Invalid student id");
  }

  try {
    const belongs = await verifyStudentOwnership(studentId, req.user.tenant_id);
    if (!belongs) {
      return sendError(res, 404, "Student not found for this tenant");
    }

    const [rows] = await db.execute(
      `SELECT
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) AS present_days,
        COUNT(*) AS total_days
       FROM attendance
       WHERE tenant_id = ? AND student_id = ?`,
      [req.user.tenant_id, studentId]
    );

    const presentDays = Number(rows[0].present_days || 0);
    const totalDays = Number(rows[0].total_days || 0);
    const percentage = totalDays > 0 ? Number(((presentDays / totalDays) * 100).toFixed(2)) : 0;

    return res.json({
      success: true,
      data: {
        student_id: studentId,
        present_days: presentDays,
        total_days: totalDays,
        attendance_percentage: percentage,
      },
    });
  } catch (error) {
    console.error("attendance summary error:", error.message);
    return sendError(res, 500, "Failed to generate attendance summary");
  }
});

app.get("/", (req, res) => {
  res.send("API Running ✅");
});

app.use((req, res) => {
  return sendError(res, 404, "Route not found");
});

app.use((error, req, res, next) => {
  console.error("Unhandled server error:", error.message);
  if (res.headersSent) {
    return next(error);
  }
  return sendError(res, 500, "Something went wrong");
});

async function startServer() {
  try {
    await db.query("SELECT 1");
    console.log("✅ MySQL Connected");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to connect DB:", error.message);
    process.exit(1);
  }
}

startServer();
