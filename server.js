const express = require('express');
const app = express();
const cors = require('cors');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const SECRET_KEY = "codeandconquer_secret";

app.use(express.json());
app.use(cors());

/* ================= DATABASE CONNECTION ================= */

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'shivani@mysql17',
  database: 'saas_student'
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log("Connected to MySQL database");
  }
});

/* ================= AUTH MIDDLEWARE ================= */

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
  } catch (err) {
    return res.status(401).json({ message: "Invalid Token" });
  }
};

/* ================= TEST ROUTE ================= */

app.get('/', (req, res) => {
  res.send("🚀 Server Running");
});

/* ================= REGISTER COLLEGE ================= */

app.post('/register-college', (req, res) => {
  const { college_name, email } = req.body;

  const sql = "INSERT INTO tenants (college_name, email) VALUES (?, ?)";

  db.query(sql, [college_name, email], (err, result) => {
    if (err) return res.send(err);
    res.send("College Registered Successfully");
  });
});

/* ================= REGISTER ADMIN ================= */

app.post('/register-admin', async (req, res) => {
  const { name, email, password, tenant_id } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO users (name, email, password, role, tenant_id)
      VALUES (?, ?, ?, 'admin', ?)
    `;

    db.query(sql, [name, email, hashedPassword, tenant_id], (err, result) => {
      if (err) return res.send(err);
      res.send("Admin Registered Successfully");
    });

  } catch (error) {
    res.send(error);
  }
});

/* ================= LOGIN ================= */

app.post('/login', (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM users WHERE email = ?";

  db.query(sql, [email], async (err, results) => {

    if (err) {
      return res.status(500).json({ message: "Database Error", error: err });
    }

    if (results.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const user = results[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { user_id: user.user_id, tenant_id: user.tenant_id, role: user.role },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.json({ message: "Login successful", token });
  });
});
/* ================= ADD STUDENT ================= */

app.get("/students", authMiddleware, (req, res) => {

  const { search = "", course = "", year = "", page = 1, limit = 5 } = req.query;

  const offset = (page - 1) * limit;

  let sql = `SELECT * FROM students WHERE tenant_id = ?`;
  let countSql = `SELECT COUNT(*) as total FROM students WHERE tenant_id = ?`;

  let params = [req.user.tenant_id];
  let countParams = [req.user.tenant_id];

  if (search) {
    sql += " AND name LIKE ?";
    countSql += " AND name LIKE ?";
    params.push(`%${search}%`);
    countParams.push(`%${search}%`);
  }

  if (course) {
    sql += " AND course = ?";
    countSql += " AND course = ?";
    params.push(course);
    countParams.push(course);
  }

  if (year) {
    sql += " AND year = ?";
    countSql += " AND year = ?";
    params.push(year);
    countParams.push(year);
  }

  sql += " LIMIT ? OFFSET ?";
  params.push(parseInt(limit), parseInt(offset));

  db.query(countSql, countParams, (err, countResult) => {
    if (err) return res.status(500).json({ message: "Count Error", err });

    db.query(sql, params, (err, results) => {
      if (err) return res.status(500).json({ message: "Database Error", err });

      res.json({
        students: results,
        total: countResult[0].total
      });
    });
  });
});
/* ================= GET STUDENTS ================= */

app.get("/students", authMiddleware, (req, res) => {

  const { search, course, year } = req.query;

  let sql = "SELECT * FROM students WHERE tenant_id = ?";
  let params = [req.user.tenant_id];

  if (search) {
    sql += " AND LOWER(name) LIKE ?";
    params.push(`%${search.toLowerCase()}%`);
  }

  if (course) {
    sql += " AND LOWER(course) = ?";
    params.push(course.toLowerCase());
  }

  if (year) {
    sql += " AND year = ?";
    params.push(parseInt(year));
  }

  console.log("QUERY:", req.query);
  console.log("SQL:", sql);
  console.log("PARAMS:", params);

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("ERROR:", err);
      return res.status(500).json({ message: "Database Error", error: err });
    }

    console.log("RESULTS:", results);
    res.json(results);
  });
});
/* ================= DELETE ================= */

app.delete("/delete-student/:id", authMiddleware, (req, res) => {

  const sql = `
    DELETE FROM students 
    WHERE student_id=? AND tenant_id=?
  `;

  db.query(sql, [req.params.id, req.user.tenant_id], (err, result) => {
    if (err) return res.send(err);
    res.send("Deleted");
  });
});

/* ================= UPDATE ================= */

app.put("/update-student/:id", authMiddleware, (req, res) => {

  const { name, email, course, year, attendance, fees_status } = req.body;

  const sql = `
    UPDATE students 
    SET name=?, email=?, course=?, year=?, attendance=?, fees_status=?
    WHERE student_id=? AND tenant_id=?
  `;

  db.query(
    sql,
    [name, email, course, year, attendance, fees_status, req.params.id, req.user.tenant_id],
    (err, result) => {
      if (err) return res.send(err);
      res.send("Updated");
    }
  );
});

/* ================= SERVER ================= */

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});