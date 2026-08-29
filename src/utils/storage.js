// LocalStorage & API Hybrid Storage for VNR VJIET Attendance System
import { STUDENTS } from '../data/masterData.js';

const STORAGE_KEY = 'vnr_attendance_sessions_v1';

export function getLocalSessions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error reading local attendance sessions:', e);
    return [];
  }
}

export function saveLocalSession(payload) {
  try {
    const existing = getLocalSessions();
    const sessionId = Date.now();
    const now = new Date();
    
    const newSession = {
      id: sessionId,
      subject: payload.subject,
      course_code: payload.courseCode || '-',
      faculty: payload.faculty || '-',
      room: payload.room || '-',
      batch: payload.batch || 'All Students',
      date: payload.date || now.toISOString().split('T')[0],
      start_time: payload.startTime || '10:00 AM',
      end_time: payload.endTime || '11:00 AM',
      submitted_by: payload.submittedBy || 'Class Representative',
      submitter_role: 'class_representative',
      created_at: now.toISOString(),
      notes: payload.notes || '',
      students: payload.students || []
    };

    // Calculate totals
    const presentCount = (payload.students || []).filter(s => s.status === 'PRESENT').length;
    const absentCount = (payload.students || []).filter(s => s.status === 'ABSENT').length;
    newSession.total_students = (payload.students || []).length;
    newSession.present_count = presentCount;
    newSession.absent_count = absentCount;
    newSession.percentage = newSession.total_students > 0 
      ? Math.round((presentCount / newSession.total_students) * 100) 
      : 100;

    // Check duplicate
    const isDuplicate = existing.some(s => 
      s.subject === newSession.subject && 
      s.date === newSession.date && 
      s.start_time === newSession.start_time &&
      s.batch === newSession.batch
    );

    if (isDuplicate) {
      // Update existing record
      const updated = existing.map(s => 
        (s.subject === newSession.subject && s.date === newSession.date && s.start_time === newSession.start_time && s.batch === newSession.batch)
          ? newSession
          : s
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return { ok: true, sessionId, updated: true };
    }

    existing.unshift(newSession);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    return { ok: true, sessionId, created: true };
  } catch (e) {
    console.error('Error saving local attendance session:', e);
    return { ok: false, error: e.message };
  }
}

export function deleteLocalSession(sessionId) {
  try {
    const existing = getLocalSessions();
    const filtered = existing.filter(s => String(s.id) !== String(sessionId));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (e) {
    return false;
  }
}

export function updateLocalSession(sessionId, updatedData) {
  try {
    const existing = getLocalSessions();
    const updated = existing.map(s => {
      if (String(s.id) === String(sessionId)) {
        return { ...s, ...updatedData };
      }
      return s;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return true;
  } catch (e) {
    return false;
  }
}
