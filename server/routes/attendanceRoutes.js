import express from 'express';
import crypto from 'crypto';
import { query, get, run } from '../db.js';
import { authenticateToken, logAudit } from '../auth.js';
import { STUDENTS } from '../data/masterData.js';

const router = express.Router();

// GET /api/attendance - list sessions with filtering
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { date, startDate, endDate, subject, batch, cr, group } = req.query;
    let sql = 'SELECT * FROM attendance_sessions WHERE 1=1';
    const params = [];

    // CR permission check: if CR, they can filter or see all, but only edit own
    if (date) {
      sql += ' AND date = ?';
      params.push(date);
    }
    if (startDate && endDate) {
      sql += ' AND date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }
    if (subject && subject !== 'ALL') {
      sql += ' AND subject = ?';
      params.push(subject);
    }
    if (batch && batch !== 'ALL') {
      sql += ' AND batch = ?';
      params.push(batch);
    }
    if (cr && cr !== 'ALL') {
      sql += ' AND created_by = ?';
      params.push(cr);
    }
    if (group && group !== 'ALL') {
      sql += ' AND cr_group = ?';
      params.push(group);
    }

    sql += ' ORDER BY date DESC, created_at DESC';
    const sessions = await query(sql, params);

    // Map to camelCase response format
    const formatted = sessions.map(s => ({
      sessionId: s.id,
      date: s.date,
      startTime: s.start_time,
      endTime: s.end_time,
      subject: s.subject,
      courseCode: s.course_code,
      faculty: s.faculty,
      room: s.room,
      batch: s.batch,
      createdBy: s.created_by,
      createdByRole: s.created_by_role,
      crGroup: s.cr_group,
      createdAt: s.created_at,
      lastModifiedBy: s.last_modified_by,
      lastModifiedAt: s.last_modified_at,
      presentCount: s.present_count,
      absentCount: s.absent_count,
      totalCount: s.total_count,
      notes: s.notes
    }));

    res.json({ sessions: formatted, count: formatted.length });
  } catch (err) {
    console.error('Error fetching attendance:', err);
    res.status(500).json({ error: 'Failed to fetch attendance sessions' });
  }
});

// GET /api/attendance/:sessionId - get single session with all student statuses
router.get('/:sessionId', authenticateToken, async (req, res) => {
  const { sessionId } = req.params;

  try {
    const session = await get('SELECT * FROM attendance_sessions WHERE id = ?', [sessionId]);
    if (!session) {
      return res.status(404).json({ error: 'Attendance session not found' });
    }

    const records = await query(`
      SELECT 
        r.student_roll as rollNumber,
        r.student_name as name,
        r.batch,
        r.status,
        s.s_no as sNo
      FROM attendance_records r
      JOIN students s ON r.student_roll = s.roll_number
      WHERE r.session_id = ?
      ORDER BY s.s_no ASC
    `, [sessionId]);

    res.json({
      session: {
        sessionId: session.id,
        date: session.date,
        startTime: session.start_time,
        endTime: session.end_time,
        subject: session.subject,
        courseCode: session.course_code,
        faculty: session.faculty,
        room: session.room,
        batch: session.batch,
        createdBy: session.created_by,
        createdByRole: session.created_by_role,
        crGroup: session.cr_group,
        createdAt: session.created_at,
        lastModifiedBy: session.last_modified_by,
        lastModifiedAt: session.last_modified_at,
        presentCount: session.present_count,
        absentCount: session.absent_count,
        totalCount: session.total_count,
        notes: session.notes
      },
      records
    });
  } catch (err) {
    console.error('Error fetching session details:', err);
    res.status(500).json({ error: 'Failed to fetch attendance session details' });
  }
});

// POST /api/attendance - save new attendance session
router.post('/', authenticateToken, async (req, res) => {
  const {
    date,
    startTime,
    endTime,
    subject,
    courseCode,
    faculty,
    room,
    batch,
    students, // array of { rollNumber, status }
    notes = ''
  } = req.body;

  if (!date || !startTime || !endTime || !subject || !batch || !Array.isArray(students)) {
    return res.status(400).json({ error: 'Missing required attendance fields' });
  }

  try {
    // Check duplicate session for same Date + StartTime + EndTime + Subject + Batch
    const existing = await get(`
      SELECT id, created_by FROM attendance_sessions 
      WHERE date = ? AND start_time = ? AND end_time = ? AND subject = ? AND batch = ?
    `, [date, startTime, endTime, subject, batch]);

    if (existing) {
      return res.status(409).json({ 
        error: `An attendance session already exists for ${subject} (${batch}) on ${date} (${startTime} – ${endTime}) submitted by ${existing.created_by}.`,
        existingSessionId: existing.id
      });
    }

    const sessionId = `att_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const createdAt = new Date().toISOString();

    const presentCount = students.filter(s => s.status === 'PRESENT').length;
    const absentCount = students.length - presentCount;
    const totalCount = students.length;

    // Insert Session
    await run(`
      INSERT INTO attendance_sessions (
        id, date, start_time, end_time, subject, course_code, faculty, room,
        batch, created_by, created_by_role, cr_group, created_at,
        present_count, absent_count, total_count, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      sessionId, date, startTime, endTime, subject, courseCode || '-', faculty || '-', room || '-',
      batch, req.user.display_name, req.user.role, req.user.group_name, createdAt,
      presentCount, absentCount, totalCount, notes
    ]);

    // Insert student records
    for (const item of students) {
      const studentInfo = STUDENTS.find(s => s.rollNumber === item.rollNumber) || { name: 'Unknown', batch: 'Batch 1' };
      await run(`
        INSERT INTO attendance_records (session_id, student_roll, student_name, batch, status)
        VALUES (?, ?, ?, ?, ?)
      `, [sessionId, item.rollNumber, studentInfo.name, studentInfo.batch, item.status === 'PRESENT' ? 'PRESENT' : 'ABSENT']);
    }

    // Audit Log
    await logAudit({
      userName: req.user.display_name,
      role: req.user.role,
      action: 'CREATE_ATTENDANCE',
      sessionId,
      subject,
      date,
      time: startTime,
      details: `Created attendance for ${subject} (${batch}): ${presentCount} present, ${absentCount} absent out of ${totalCount}`
    });

    res.status(201).json({
      success: true,
      sessionId,
      message: 'Attendance saved successfully'
    });
  } catch (err) {
    console.error('Error saving attendance session:', err);
    res.status(500).json({ error: 'Failed to save attendance session' });
  }
});

// PUT /api/attendance/:sessionId - update attendance
router.put('/:sessionId', authenticateToken, async (req, res) => {
  const { sessionId } = req.params;
  const { students, notes } = req.body;

  try {
    const session = await get('SELECT * FROM attendance_sessions WHERE id = ?', [sessionId]);
    if (!session) {
      return res.status(404).json({ error: 'Attendance session not found' });
    }

    // Any authorized user can edit or update attendance
    if (Array.isArray(students)) {
      const presentCount = students.filter(s => s.status === 'PRESENT').length;
      const absentCount = students.length - presentCount;
      const totalCount = students.length;
      const lastModifiedAt = new Date().toISOString();

      await run(`
        UPDATE attendance_sessions 
        SET present_count = ?, absent_count = ?, total_count = ?, last_modified_by = ?, last_modified_at = ?, notes = ?
        WHERE id = ?
      `, [presentCount, absentCount, totalCount, req.user?.display_name || 'Admin', lastModifiedAt, notes !== undefined ? notes : session.notes, sessionId]);

      // Update student statuses
      for (const item of students) {
        await run(`
          UPDATE attendance_records 
          SET status = ? 
          WHERE session_id = ? AND student_roll = ?
        `, [item.status === 'PRESENT' ? 'PRESENT' : 'ABSENT', sessionId, item.rollNumber]);
      }
    }

    // Audit Log
    await logAudit({
      userName: req.user?.display_name || 'Class Attendance Admin',
      role: 'admin',
      action: 'EDIT_ATTENDANCE',
      sessionId,
      subject: session.subject,
      date: session.date,
      time: session.start_time,
      details: `Edited attendance for ${session.subject} (${session.batch})`
    });

    res.json({ success: true, message: 'Attendance updated successfully' });
  } catch (err) {
    console.error('Error updating attendance:', err);
    res.status(500).json({ error: 'Failed to update attendance session' });
  }
});

// DELETE /api/attendance/:sessionId - delete session
router.delete('/:sessionId', authenticateToken, async (req, res) => {
  const { sessionId } = req.params;

  try {
    const session = await get('SELECT * FROM attendance_sessions WHERE id = ?', [sessionId]);
    if (!session) {
      return res.status(404).json({ error: 'Attendance session not found' });
    }

    // Delete records and session
    await run('DELETE FROM attendance_records WHERE session_id = ?', [sessionId]);
    await run('DELETE FROM attendance_sessions WHERE id = ?', [sessionId]);

    // Audit Log
    await logAudit({
      userName: req.user?.display_name || 'Class Attendance Admin',
      role: 'admin',
      action: 'DELETE_ATTENDANCE',
      sessionId,
      subject: session.subject,
      date: session.date,
      time: session.start_time,
      details: `Deleted attendance session ${session.subject} on ${session.date}`
    });

    res.json({ success: true, message: 'Attendance session deleted successfully' });
  } catch (err) {
    console.error('Error deleting attendance:', err);
    res.status(500).json({ error: 'Failed to delete attendance session' });
  }
});

export default router;
