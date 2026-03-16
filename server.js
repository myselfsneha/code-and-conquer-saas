const express = require('express');
const app = express();
const cors = require('cors');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const authMiddleware = require("./middleware/authMiddleware");

const SECRET_KEY = "codeandconquer_secret";

app.use(express.json());
app.use(cors());

/* ================= DATABASE CONNECTION ================= */

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '2003',
  database: 'saas_student'
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log("Connected to MySQL database");
  }
});

/* ================= TEST ROUTE ================= */

app.get('/', (req, res) => {
  res.send("🚀 Code & Conquer SaaS Running Successfully");
});

/* ================= REGISTER COLLEGE ================= */

app.post('/register-college', (req, res) => {
  const { college_name, email } = req.body;

  const sql = "INSERT INTO tenants (college_name, email) VALUES (?, ?)";

  db.query(sql, [college_name, email], (err, result) => {
    if (err) return res.status(500).send("Database Error");
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
      if (err) return res.status(500).send(err);
      res.send("Admin Registered Successfully");
    });

  } catch (error) {
    res.status(500).send(error);
  }
});

/* ================= LOGIN ================= */

app.post('/login', (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM users WHERE email = ?";

  db.query(sql, [email], async (err, results) => {
    if (err) return res.status(500).send(err);
    if (results.length === 0) return res.status(400).send("User not found");

    const user = results[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).send("Invalid password");

    const token = jwt.sign(
      { user_id: user.user_id, tenant_id: user.tenant_id, role: user.role },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.json({ message: "Login successful", token });
  });
});

/* ================= DASHBOARD (PROTECTED) ================= */

app.get("/dashboard", authMiddleware, (req, res) => {
  res.json({
    message: "Welcome to Dashboard",
    user: req.user
  });
});

/* ================= ADD STUDENT (ADMIN ONLY) ================= */

app.post("/add-student", authMiddleware, (req, res) => {

  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Access denied. Admins only."
    });
  }

  const { name, email, course, year, attendance, fees_status } = req.body;

  const sql = `
    INSERT INTO students 
    (name, email, course, year, attendance, fees_status, tenant_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [name, email, course, year, attendance, fees_status, req.user.tenant_id],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Database Error" });
      }

      res.json({ message: "Student added successfully" });
    }
  );
});

/* ================= GET STUDENTS (TENANT ISOLATED) ================= */

app.get("/students", authMiddleware, (req, res) => {

  const sql = "SELECT * FROM students WHERE tenant_id = ?";

  db.query(sql, [req.user.tenant_id], (err, results) => {
    if (err) return res.status(500).json({ message: "Database Error" });

    res.json(results);
  });
});

/* ================= SERVER START ================= */
app.delete("/delete-student/:id", authMiddleware, (req, res) => {

  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Access denied. Admins only."
    });
  }

  const studentId = req.params.id;

  const sql = `
    DELETE FROM students 
    WHERE student_id=? AND tenant_id=?
  `;

  db.query(
    sql,
    [studentId, req.user.tenant_id],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Database Error" });

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Student not found" });
      }

      res.json({ message: "Student deleted successfully" });
    }
  );
});
app.put("/update-student/:id", authMiddleware, (req, res) => {

  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Access denied. Admins only."
    });
  }

  const studentId = req.params.id;
  const { name, email, course, year, attendance, fees_status } = req.body;

  const sql = `
    UPDATE students 
    SET name=?, email=?, course=?, year=?, attendance=?, fees_status=?
    WHERE student_id=? AND tenant_id=?
  `;

  db.query(
    sql,
    [name, email, course, year, attendance, fees_status, studentId, req.user.tenant_id],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Database Error" });

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Student not found" });
      }

      res.json({ message: "Student updated successfully" });
    }
  );
});
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});