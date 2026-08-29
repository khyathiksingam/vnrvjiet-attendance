import express from 'express';
import { query } from '../db.js';
import { authenticateToken } from '../auth.js';

const router = express.Router();

// GET /api/audit
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { user, action, date, limit = 100 } = req.query;
    let sql = 'SELECT * FROM audit_logs WHERE 1=1';
    const params = [];

    if (user && user !== 'ALL') {
      sql += ' AND user_name = ?';
      params.push(user);
    }
    if (action && action !== 'ALL') {
      sql += ' AND action = ?';
      params.push(action);
    }
    if (date) {
      sql += ' AND date = ?';
      params.push(date);
    }

    sql += ' ORDER BY timestamp DESC LIMIT ?';
    params.push(parseInt(limit, 10));

    const logs = await query(sql, params);
    res.json({ logs });
  } catch (err) {
    console.error('Error fetching audit logs:', err);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

export default router;
