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

app.get('/students', authMiddleware, (req, res) => {
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

app.get("/app-status", (req, res) => {
  res.send("Server running properly ✅");
});