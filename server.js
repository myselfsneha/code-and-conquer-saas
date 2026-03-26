const express = require('express');
const app = express();
const cors = require('cors');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const SECRET_KEY = "codeandconquer_secret";

app.use(express.json());
app.use(cors({
  origin: "*"
}));

/* ================= DATABASE ================= */

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '2003', // change if needed
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
    return res.status(403).json({ message: "No token" });
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

/* ================= REGISTER ================= */

app.post('/register-admin', async (req, res) => {
  const { name, email, password, tenant_id } = req.body;

  if (!name || !email || !password || !tenant_id) {
    return res.status(400).json({ message: "Missing fields" });
  }

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
      { user_id: user.user_id, tenant_id: user.tenant_id },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.json({ token });
  });
});

/* ================= STUDENTS ================= */

<<<<<<< HEAD
app.get('/students', authMiddleware, (req, res) => {
=======
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

  let params = [
  req.user.tenant_id, // students
  req.user.tenant_id, // fees
  req.user.tenant_id  // attendance
];

let countParams = [
  req.user.tenant_id,
  req.user.tenant_id,
  req.user.tenant_id
];

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

>>>>>>> 8b41e26 (features implemented)
  db.query(
    "SELECT * FROM students WHERE tenant_id=?",
    [req.user.tenant_id],
    (err, results) => {
      if (err) return res.status(500).json(err);
      res.json(results);
    }
  );
});

/* ================= ADD STUDENT ================= */

app.post('/students', authMiddleware, (req, res) => {
  const { name, email, course, year } = req.body;

  db.query(
    `INSERT INTO students (name, email, course, year, tenant_id)
     VALUES (?, ?, ?, ?, ?)`,
    [name, email, course, year, req.user.tenant_id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Student added" });
    }
  );
});

/* ================= SERVER ================= */

app.listen(3000, () => {
  console.log("🚀 Server running on http://localhost:3000");
});