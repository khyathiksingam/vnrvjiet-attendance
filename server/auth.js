import { run } from './db.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'vnr-vjiet-attendance-secret-key-2026';

// Pass-through middleware (no login required)
export const authenticateToken = (req, res, next) => {
  req.user = {
    id: 1,
    username: 'cr',
    displayName: 'Class Representative',
    role: 'class_representative',
    groupName: 'General'
  };
  next();
};

export const requireCR = (req, res, next) => {
  next();
};

export const requireCentralMember = (req, res, next) => {
  next();
};

export const logAudit = async ({ userName = 'Class Representative', role = 'class_representative', action, sessionId = null, subject = null, date = null, time = null, details = '' }) => {
  try {
    const now = new Date();
    const currentDate = date || now.toISOString().split('T')[0];
    const currentTime = time || now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    
    await run(
      'INSERT INTO audit_logs (user_name, role, action, session_id, subject, date, time, timestamp, details) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [userName, role, action, sessionId, subject, currentDate, currentTime, now.toISOString(), details]
    );
  } catch (err) {
    console.error('Audit log error:', err);
  }
};

