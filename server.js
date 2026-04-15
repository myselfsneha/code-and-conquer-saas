const express = require("express");
const app = express();
const cors = require("cors");
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

const mysql = require("mysql2");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

require("dotenv").config();
const SECRET_KEY = "codeandconquer_secret";

app.use(express.json());

const path = require("path");

// Serve frontend folder
app.use(express.static(path.join(__dirname, "frontend")));
/* ================= DATABASE ================= */

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});


db.connect((err) => {
  if (err) {
    console.error("❌ DB Error:", err.message);
  } else {
    console.log("✅ MySQL Connected");
  }
});

db.on("error", (err) => {
  console.error("⚠️ DB Connection Lost:", err.message);
});

/* ================= AUTH MIDDLEWARE ================= */

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
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

/* ================= REGISTER ADMIN ================= */

app.post("/register-admin", async (req, res) => {
  const { name, email, password, tenant_id } = req.body;

  if (!name || !email || !password || !tenant_id) {
    return res.status(400).json({ message: "Missing fields" });
  }

  try {
    const hashed = await bcrypt.hash(password, 10);

    db.query(
      `INSERT INTO users (name, email, password, role, tenant_id)
       VALUES (?, ?, ?, 'college', ?)`,   // ✅ FIXED HERE
      [name, email, hashed, tenant_id],
      (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "College Registered" });
      }
    );
  } catch (err) {
    res.status(500).json(err);
  }
});
/* ================= LOGIN ================= */

app.post("/login", (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ message: "All fields required" });
  }

  db.query(
    "SELECT * FROM users WHERE email=? AND role=?",
    [email, role],
    async (err, results) => {
      if (err) return res.status(500).json(err);

      if (results.length === 0) {
        return res.status(400).json({ message: "User not found" });
      }

      const user = results[0];
      const match = await bcrypt.compare(password, user.password);

      if (!match) {
        return res.status(400).json({ message: "Invalid password" });
      }

      const token = jwt.sign(
        {
          user_id: user.user_id,
          tenant_id: user.tenant_id,
          role: user.role
        },
        SECRET_KEY,
        { expiresIn: "1h" }
      );

      res.json({ token });
    }
  );
});

/* ================= GET STUDENTS ================= */

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
    req.user.tenant_id,
    req.user.tenant_id,
    req.user.tenant_id
  ];

  let countParams = [...params];

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
  if (req.user.role !== "college") {   // ✅ FIXED
    return res.status(403).json({ message: "Access denied" });
  }

  const { name, email, course, year } = req.body;

  if (!name || !email || !course || !year) {
    return res.status(400).json({ message: "All fields required" });
  }

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

/* ================= COURSES ================= */

/* GET COURSES */
app.get("/courses", authMiddleware, (req, res) => {
  db.query(
    "SELECT * FROM courses WHERE tenant_id=?",
    [req.user.tenant_id],
    (err, results) => {
      if (err) return res.status(500).json(err);
      res.json(results);
    }
  );
});

/* ADD COURSE */
app.post("/courses", authMiddleware, (req, res) => {
  if (req.user.role !== "college") {   // ✅ FIXED
    return res.status(403).json({ message: "Access denied" });
  }

  const { name, duration, fees } = req.body;

  if (!name || !duration || !fees) {
    return res.status(400).json({ message: "All fields required" });
  }

  db.query(
    "INSERT INTO courses (name, duration, fees, tenant_id) VALUES (?, ?, ?, ?)",
    [name, duration, fees, req.user.tenant_id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Course added" });
    }
  );
});

/* DELETE COURSE */
app.delete("/courses/:id", authMiddleware, (req, res) => {
  db.query(
    "DELETE FROM courses WHERE course_id=? AND tenant_id=?",
    [req.params.id, req.user.tenant_id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Course deleted" });
    }
  );
});

/* ================= ADD FEES ================= */

app.post("/fees", authMiddleware, (req, res) => {
  if (req.user.role !== "college") {
    return res.status(403).json({ message: "Access denied" });
  }

  const { student_id, amount_paid } = req.body;

  if (!student_id || !amount_paid) {
    return res.status(400).json({ message: "All fields required" });
  }

  db.query(
    "INSERT INTO fees (student_id, amount_paid, tenant_id) VALUES (?, ?, ?)",
    [student_id, amount_paid, req.user.tenant_id],
    (err) => {
      if (err) {
        console.error("FEES ERROR:", err);
        return res.status(500).json({ message: err.message });
      }
      res.json({ message: "Fees added" });
    }
  );
});

/* ================= ADD ATTENDANCE ================= */

app.post("/attendance", authMiddleware, (req, res) => {
  if (req.user.role !== "college") {
    return res.status(403).json({ message: "Access denied" });
  }

  const { student_id, status, date } = req.body;

  if (!student_id || !status || !date) {
    return res.status(400).json({ message: "All fields required" });
  }

  db.query(
    "INSERT INTO attendance (student_id, status, date, tenant_id) VALUES (?, ?, ?, ?)",
    [student_id, status, date, req.user.tenant_id],
    (err) => {
      if (err) {
        console.error("ATTENDANCE ERROR:", err);
        return res.status(500).json({ message: err.message });
      }
      res.json({ message: "Attendance marked" });
    }
  );
});
/* ================= SERVER ================= */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

app.get("/", (req, res) => {
  res.send("API Running ✅");
});

app.get("/app-status", (req, res) => {
  res.send("Server running properly ✅");
});
