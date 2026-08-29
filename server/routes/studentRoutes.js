import express from 'express';
import { query, get } from '../db.js';
import { authenticateToken } from '../auth.js';

const router = express.Router();

// GET /api/students
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { batch, search } = req.query;
    let sql = 'SELECT s_no as sNo, roll_number as rollNumber, name, batch FROM students WHERE 1=1';
    const params = [];

    if (batch && (batch === 'Batch 1' || batch === 'Batch 2')) {
      sql += ' AND batch = ?';
      params.push(batch);
    }

    if (search) {
      sql += ' AND (roll_number LIKE ? OR name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY s_no ASC';
    const students = await query(sql, params);
    res.json({ students, total: students.length });
  } catch (err) {
    console.error('Error fetching students:', err);
    res.status(500).json({ error: 'Failed to fetch student roster' });
  }
});

// GET /api/students/:roll/history
router.get('/:roll/history', authenticateToken, async (req, res) => {
  const { roll } = req.params;

  try {
    const student = await get(
      'SELECT s_no as sNo, roll_number as rollNumber, name, batch FROM students WHERE roll_number = ?',
      [roll.toUpperCase()]
    );

    if (!student) {
      return res.status(404).json({ error: 'Student not found in master roster' });
    }

    // Get all attendance sessions applicable to this student
    // A student is applicable if the session is for 'All Students' OR matching student's batch
    const records = await query(`
      SELECT 
        s.id as sessionId,
        s.date,
        s.start_time as startTime,
        s.end_time as endTime,
        s.subject,
        s.course_code as courseCode,
        s.faculty,
        s.room,
        s.batch as sessionBatch,
        s.created_by as createdBy,
        s.cr_group as crGroup,
        r.status,
        s.created_at as createdAt
      FROM attendance_records r
      JOIN attendance_sessions s ON r.session_id = s.id
      WHERE r.student_roll = ?
      ORDER BY s.date DESC, s.created_at DESC
    `, [student.rollNumber]);

    const totalApplicable = records.length;
    const presentCount = records.filter(r => r.status === 'PRESENT').length;
    const absentCount = totalApplicable - presentCount;
    const attendancePercentage = totalApplicable > 0 
      ? Number(((presentCount / totalApplicable) * 100).toFixed(1)) 
      : 100;

    res.json({
      student,
      stats: {
        totalApplicable,
        presentCount,
        absentCount,
        attendancePercentage
      },
      records
    });
  } catch (err) {
    console.error('Error fetching student history:', err);
    res.status(500).json({ error: 'Failed to fetch student attendance history' });
  }
});

export default router;
