CREATE TABLE IF NOT EXISTS users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(150) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin','student') NOT NULL DEFAULT 'student',
  tenant_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_user_tenant_email (tenant_id, email),
  KEY idx_users_tenant_role (tenant_id, role)
);

CREATE TABLE IF NOT EXISTS courses (
  course_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  duration VARCHAR(60) NOT NULL,
  fees DECIMAL(10,2) NOT NULL,
  tenant_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_course_tenant_name (tenant_id, name),
  KEY idx_courses_tenant (tenant_id)
);

CREATE TABLE IF NOT EXISTS students (
  student_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(150) NOT NULL,
  course VARCHAR(120) NOT NULL,
  year INT NOT NULL,
  tenant_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_student_tenant_email (tenant_id, email),
  KEY idx_students_tenant_course_year (tenant_id, course, year),
  CONSTRAINT chk_students_year CHECK (year >= 1)
);

CREATE TABLE IF NOT EXISTS fees (
  fee_id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  amount_paid DECIMAL(10,2) NOT NULL,
  tenant_id INT NOT NULL,
  paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY idx_fees_tenant_student (tenant_id, student_id),
  CONSTRAINT fk_fees_student FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS attendance (
  attendance_id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  status ENUM('present','absent') NOT NULL,
  date DATE NOT NULL,
  tenant_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY idx_attendance_tenant_student_date (tenant_id, student_id, date),
  CONSTRAINT fk_attendance_student FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);
