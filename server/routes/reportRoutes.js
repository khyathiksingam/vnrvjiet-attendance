import express from 'express';
import { query } from '../db.js';
import { authenticateToken } from '../auth.js';
import { STUDENTS, COURSES } from '../data/masterData.js';

const router = express.Router();

// GET /api/reports/dashboard-stats
router.get('/dashboard-stats', authenticateToken, async (req, res) => {
  try {
    const totalStudents = STUDENTS.length;
    const sessionCount = await query('SELECT COUNT(*) as count FROM attendance_sessions');
    
    // CR-specific session counts
    const crCounts = await query(`
      SELECT created_by as createdBy, COUNT(*) as count 
      FROM attendance_sessions 
      GROUP BY created_by
    `);

    // Today's attendance rate
    const today = new Date().toISOString().split('T')[0];
    const todaySessions = await query('SELECT * FROM attendance_sessions WHERE date = ?', [today]);

    let todayPresent = 0;
    let todayTotal = 0;
    todaySessions.forEach(s => {
      todayPresent += s.present_count;
      todayTotal += s.total_count;
    });

    const todayPercentage = todayTotal > 0 ? Number(((todayPresent / todayTotal) * 100).toFixed(1)) : 0;

    res.json({
      totalStudents,
      totalSessions: sessionCount[0]?.count || 0,
      todaySessionsCount: todaySessions.length,
      todayPresent,
      todayTotal,
      todayPercentage,
      crCounts: {
        'Girl CR 1': crCounts.find(c => c.createdBy === 'Girl CR 1')?.count || 0,
        'Girl CR 2': crCounts.find(c => c.createdBy === 'Girl CR 2')?.count || 0,
        'Boy CR 1': crCounts.find(c => c.createdBy === 'Boy CR 1')?.count || 0,
        'Boy CR 2': crCounts.find(c => c.createdBy === 'Boy CR 2')?.count || 0,
        'Central Member': crCounts.find(c => c.createdBy === 'Central Member')?.count || 0,
      }
    });
  } catch (err) {
    console.error('Error fetching dashboard stats:', err);
    res.status(500).json({ error: 'Failed to calculate statistics' });
  }
});

// GET /api/reports/subject-summary
router.get('/subject-summary', authenticateToken, async (req, res) => {
  try {
    const rows = await query(`
      SELECT 
        subject,
        course_code as courseCode,
        COUNT(id) as totalClasses,
        SUM(present_count) as totalPresent,
        SUM(total_count) as totalPossible
      FROM attendance_sessions
      GROUP BY subject
    `);

    const summary = rows.map(r => ({
      subject: r.subject,
      courseCode: r.courseCode,
      totalClasses: r.totalClasses,
      totalPresent: r.totalPresent,
      totalPossible: r.totalPossible,
      attendancePercentage: r.totalPossible > 0 ? Number(((r.totalPresent / r.totalPossible) * 100).toFixed(1)) : 100
    }));

    res.json({ summary });
  } catch (err) {
    console.error('Error fetching subject summary:', err);
    res.status(500).json({ error: 'Failed to calculate subject summary' });
  }
});

// GET /api/reports/student-summary
router.get('/student-summary', authenticateToken, async (req, res) => {
  try {
    const { batch } = req.query;
    
    const records = await query(`
      SELECT 
        student_roll as rollNumber,
        status
      FROM attendance_records
    `);

    const countsByRoll = {};
    records.forEach(r => {
      if (!countsByRoll[r.rollNumber]) {
        countsByRoll[r.rollNumber] = { present: 0, total: 0 };
      }
      countsByRoll[r.rollNumber].total += 1;
      if (r.status === 'PRESENT') {
        countsByRoll[r.rollNumber].present += 1;
      }
    });

    let studentsList = STUDENTS;
    if (batch && (batch === 'Batch 1' || batch === 'Batch 2')) {
      studentsList = STUDENTS.filter(s => s.batch === batch);
    }

    const summary = studentsList.map(s => {
      const stat = countsByRoll[s.rollNumber] || { present: 0, total: 0 };
      const pct = stat.total > 0 ? Number(((stat.present / stat.total) * 100).toFixed(1)) : 100;
      return {
        sNo: s.sNo,
        rollNumber: s.rollNumber,
        name: s.name,
        batch: s.batch,
        totalClasses: stat.total,
        present: stat.present,
        absent: stat.total - stat.present,
        attendancePercentage: pct,
        isLowAttendance: pct < 75 && stat.total > 0
      };
    });

    res.json({ summary });
  } catch (err) {
    console.error('Error fetching student summary:', err);
    res.status(500).json({ error: 'Failed to calculate student summary' });
  }
});

export default router;
