const express = require('express');
const app = express();
const cors = require('cors');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const SECRET_KEY = "codeandconquer_secret";

app.use(express.json());
app.use(cors());

/* ================= DATABASE ================= */

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'shivani@mysql17',
  database: 'saas_student'
});

db.connect(err => {
  if (err) console.error("DB Error:", err);
  else console.log("✅ MySQL Connected");
});

/* ================= AUTH ================= */

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(403).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};

/* ================= ROOT ================= */

app.get('/', (req, res) => {
  res.send("🚀 Server Running");
});

/* ================= REGISTER ================= */

app.post('/register-college', (req, res) => {
  const { college_name, email } = req.body;

  db.query(
    "INSERT INTO tenants (college_name, email) VALUES (?, ?)",
    [college_name, email],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "College Registered" });
    }
  );
});

app.post('/register-admin', async (req, res) => {
  const { name, email, password, tenant_id } = req.body;

  const hashed = await bcrypt.hash(password, 10);

  db.query(
    `INSERT INTO users (name, email, password, role, tenant_id)
     VALUES (?, ?, ?, 'admin', ?)`,
    [name, email, hashed, tenant_id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Admin Registered" });
    }
  );
});

/* ================= LOGIN ================= */

app.post('/login', (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM users WHERE email=?", [email], async (err, results) => {

    if (err) return res.status(500).json(err);
    if (results.length === 0) return res.status(400).json({ message: "User not found" });

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign(
      { user_id: user.user_id, tenant_id: user.tenant_id, role: user.role },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.json({ token });
  });
});

/* ================= STUDENTS ================= */

app.get("/students", authMiddleware, (req, res) => {

  const { search = "", course = "", year = "", page = 1, limit = 5 } = req.query;
  const offset = (page - 1) * limit;

  let baseQuery = `
    FROM students s
    LEFT JOIN (
      SELECT student_id, SUM(amount_paid) AS total_paid
      FROM fees
      WHERE tenant_id = ?
      GROUP BY student_id
    ) f ON s.student_id = f.student_id

    LEFT JOIN (
      SELECT student_id,
             SUM(CASE WHEN status='present' THEN 1 ELSE 0 END) AS present_days,
             COUNT(*) AS total_days
      FROM attendance
      WHERE tenant_id = ?
      GROUP BY student_id
    ) a ON s.student_id = a.student_id

    WHERE s.tenant_id = ?
  `;

  let params = [req.user.tenant_id,req.user.tenant_id,req.user.tenant_id];
  let countParams = [req.user.tenant_id];

  if (search) {
    baseQuery += " AND LOWER(s.name) LIKE ?";
    params.push(`%${search.toLowerCase()}%`);
    countParams.push(`%${search.toLowerCase()}%`);
  }

  if (course) {
    baseQuery += " AND LOWER(s.course) = ?";
    params.push(course.toLowerCase());
    countParams.push(course.toLowerCase());
  }

  if (year) {
    baseQuery += " AND s.year = ?";
    params.push(parseInt(year));
    countParams.push(parseInt(year));
  }

  // 🔥 FINAL QUERY WITH AGGREGATION
  const dataQuery = `
    SELECT 
      s.*,
      COALESCE(f.total_paid, 0) AS total_paid,
      COALESCE(a.present_days, 0) AS present_days,
      COALESCE(a.total_days, 0) AS total_days,
      CASE 
        WHEN a.total_days > 0 
        THEN ROUND((a.present_days / a.total_days) * 100, 2)
        ELSE 0 
      END AS attendance_percentage
    ${baseQuery}
    LIMIT ? OFFSET ?
  `;

  params.push(parseInt(limit), parseInt(offset));

  const countQuery = `SELECT COUNT(*) as total ${baseQuery}`;

  db.query(countQuery, countParams, (err, countRes) => {
    if (err) return res.status(500).json(err);

    db.query(dataQuery, params, (err, results) => {
      if (err) return res.status(500).json(err);

      res.json({
        students: results,
        total: countRes[0].total
      });
    });
  });
});
/* ================= ADD STUDENT ================= */

app.post("/students", authMiddleware, (req, res) => {

  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }

  const { name, email, course, year, fees_total } = req.body;

  if (!name || !email || !course || !year) {
    return res.status(400).json({ message: "All fields required" });
  }

  db.query(
    `INSERT INTO students (name, email, course, year, fees_total, tenant_id)
     VALUES (?, ?, ?, ?, ?, ?)`,
     [name, email, course, year, fees_total || 0, req.user.tenant_id],
    err => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Student added" });
    }
  );
});

/* ================= DELETE ================= */

app.delete("/delete-student/:id", authMiddleware, (req, res) => {

  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }

  db.query(
    "DELETE FROM students WHERE student_id=? AND tenant_id=?",
    [req.params.id, req.user.tenant_id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Deleted" });
    }
  );
});

/* ================= FEES ================= */

app.post("/add-fees", authMiddleware, (req, res) => {

  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }

  const { student_id, amount_paid } = req.body;

  if (!student_id || !amount_paid) {
    return res.status(400).json({ message: "Missing fields" });
  }

  db.query(
    `INSERT INTO fees (student_id, tenant_id, amount_paid, date, status)
     VALUES (?, ?, ?, CURDATE(), 'paid')`,
    [student_id, req.user.tenant_id, amount_paid],
    (err) => {
      if (err) {
        console.error("FEES ERROR:", err);
        return res.status(500).json({ message: "Database error" });
      }

      res.json({ message: "Fees added successfully" });
    }
  );
});

app.get("/fees-summary", authMiddleware, (req, res) => {

  db.query(
    `SELECT 
        s.student_id, 
        s.name, 
        s.fees_total,
        IFNULL(SUM(f.amount_paid), 0) AS total_paid
     FROM students s
     LEFT JOIN fees f 
        ON s.student_id = f.student_id 
        AND f.tenant_id = s.tenant_id
     WHERE s.tenant_id = ?
     GROUP BY s.student_id`,
    [req.user.tenant_id],
    (err, results) => {
      if (err) {
        console.error("FEES SUMMARY ERROR:", err);
        return res.status(500).json({ message: "Database error" });
      }

      res.json(results);
    }
  );
});
/* ================= ATTENDANCE ================= */

app.post("/mark-attendance", authMiddleware, (req, res) => {

  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }

  const { student_id, status } = req.body;

  if (!student_id || !status) {
    return res.status(400).json({ message: "Missing fields" });
  }

  db.query(
    `INSERT INTO attendance (student_id, tenant_id, date, status)
     VALUES (?, ?, CURDATE(), ?)`,
    [student_id, req.user.tenant_id, status],
    (err) => {
      if (err) {
        console.error("ATTENDANCE ERROR:", err);
        return res.status(500).json({ message: "Database error" });
      }

      res.json({ message: "Attendance marked successfully" });
    }
  );
});

app.get("/attendance-summary", authMiddleware, (req, res) => {

  db.query(
    `SELECT 
        student_id,
        COUNT(*) AS total_days,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) AS present_days
     FROM attendance
     WHERE tenant_id = ?
     GROUP BY student_id`,
    [req.user.tenant_id],
    (err, results) => {
      if (err) {
        console.error("ATTENDANCE SUMMARY ERROR:", err);
        return res.status(500).json({ message: "Database error" });
      }

      // ✅ ADD % CALCULATION HERE
      const updated = results.map(r => ({
        ...r,
        attendance_percent: r.total_days > 0 
          ? Math.round((r.present_days / r.total_days) * 100)
          : 0
      }));

      res.json(updated);
    }
  );
});
/* ================= DASHBOARD ================= */

app.get("/dashboard-stats", authMiddleware, (req, res) => {

  const tenantId = req.user.tenant_id;

  db.query(
    "SELECT COUNT(*) as total FROM students WHERE tenant_id=?",
    [tenantId],
    (err, totalRes) => {

      db.query(
        "SELECT course, COUNT(*) as count FROM students WHERE tenant_id=? GROUP BY course",
        [tenantId],
        (err, courseRes) => {

          res.json({
            total: totalRes[0].total,
            courseData: courseRes
          });
        }
      );
    }
  );
});

/* ================= SERVER ================= */

app.listen(3000, () => {
  console.log("🚀 Server running on http://localhost:3000");
});