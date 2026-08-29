import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { STUDENTS, USERS_SEED } from './data/masterData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'attendance.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err);
  } else {
    console.log('Connected to SQLite database at:', dbPath);
  }
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

export const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
};

export const get = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row || null);
    });
  });
};

export const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

export async function initDb() {
  console.log('Initializing database schema...');

  // Users table
  await run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      display_name TEXT NOT NULL,
      role TEXT NOT NULL,
      group_name TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `);

  // Students master list
  await run(`
    CREATE TABLE IF NOT EXISTS students (
      s_no INTEGER NOT NULL,
      roll_number TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      batch TEXT NOT NULL
    )
  `);

  // Attendance Sessions
  await run(`
    CREATE TABLE IF NOT EXISTS attendance_sessions (
      id TEXT PRIMARY KEY NOT NULL,
      date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      subject TEXT NOT NULL,
      course_code TEXT NOT NULL,
      faculty TEXT NOT NULL,
      room TEXT NOT NULL,
      batch TEXT NOT NULL,
      created_by TEXT NOT NULL,
      created_by_role TEXT NOT NULL,
      cr_group TEXT NOT NULL,
      created_at TEXT NOT NULL,
      last_modified_by TEXT,
      last_modified_at TEXT,
      present_count INTEGER DEFAULT 0,
      absent_count INTEGER DEFAULT 0,
      total_count INTEGER DEFAULT 0,
      notes TEXT
    )
  `);

  // Attendance Records (Student-level)
  await run(`
    CREATE TABLE IF NOT EXISTS attendance_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      student_roll TEXT NOT NULL,
      student_name TEXT NOT NULL,
      batch TEXT NOT NULL,
      status TEXT NOT NULL,
      FOREIGN KEY (session_id) REFERENCES attendance_sessions(id) ON DELETE CASCADE,
      FOREIGN KEY (student_roll) REFERENCES students(roll_number)
    )
  `);

  // Audit Logs
  await run(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_name TEXT NOT NULL,
      role TEXT NOT NULL,
      action TEXT NOT NULL,
      session_id TEXT,
      subject TEXT,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      details TEXT
    )
  `);

  // Create Indexes for fast filtering
  await run(`CREATE INDEX IF NOT EXISTS idx_sessions_date ON attendance_sessions(date)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_sessions_subject ON attendance_sessions(subject)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_sessions_created_by ON attendance_sessions(created_by)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_sessions_batch ON attendance_sessions(batch)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_records_session ON attendance_records(session_id)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_records_roll ON attendance_records(student_roll)`);

  // Seed Students (74 students)
  const existingStudents = await query('SELECT COUNT(*) as count FROM students');
  if (!existingStudents[0] || existingStudents[0].count === 0) {
    console.log('Seeding 74 student master records...');
    for (const student of STUDENTS) {
      await run(
        'INSERT INTO students (s_no, roll_number, name, batch) VALUES (?, ?, ?, ?)',
        [student.sNo, student.rollNumber, student.name, student.batch]
      );
    }
    console.log('Successfully seeded 74 students!');
  } else {
    // Ensure all 74 students exist and no duplicates
    console.log(`Database already contains ${existingStudents[0].count} students.`);
  }

  // Seed Users
  for (const user of USERS_SEED) {
    const existing = await get('SELECT id FROM users WHERE username = ?', [user.username]);
    if (!existing) {
      const hash = await bcrypt.hash(user.defaultPassword, 10);
      await run(
        'INSERT INTO users (username, password_hash, display_name, role, group_name, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        [user.username, hash, user.displayName, user.role, user.groupName, new Date().toISOString()]
      );
      console.log(`Created user: ${user.username} (${user.displayName})`);
    }
  }

  console.log('Database initialization complete.');
}

export default db;
