// LocalStorage & API Hybrid Storage for VNR VJIET Attendance System
import { STUDENTS } from '../data/masterData.js';

const STORAGE_KEY = 'vnr_attendance_sessions_v1';

// Student name map helper
const studentNameMap = {};
STUDENTS.forEach(s => {
  studentNameMap[s.rollNumber] = s.name;
});

export function normalizeSession(s) {
  if (!s) return null;
  const sid = s.sessionId || s.id || Date.now();
  const rawStudents = s.students || s.records || [];
  
  const students = rawStudents.map(st => ({
    rollNumber: st.rollNumber,
    name: st.name || st.studentName || studentNameMap[st.rollNumber] || st.rollNumber,
    studentName: st.studentName || st.name || studentNameMap[st.rollNumber] || st.rollNumber,
    status: st.status || 'PRESENT'
  }));

  const presentCount = s.presentCount ?? s.present_count ?? students.filter(st => st.status === 'PRESENT').length;
  const absentCount = s.absentCount ?? s.absent_count ?? students.filter(st => st.status === 'ABSENT').length;
  const totalCount = s.totalCount ?? s.total_students ?? (students.length > 0 ? students.length : 74);
  const percentage = s.percentage ?? (totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 100);

  return {
    ...s,
    id: sid,
    sessionId: sid,
    date: s.date || new Date().toISOString().split('T')[0],
    startTime: s.startTime || s.start_time || '10:00 AM',
    start_time: s.startTime || s.start_time || '10:00 AM',
    endTime: s.endTime || s.end_time || '11:00 AM',
    end_time: s.endTime || s.end_time || '11:00 AM',
    subject: s.subject || 'OS',
    courseCode: s.courseCode || s.course_code || '-',
    course_code: s.courseCode || s.course_code || '-',
    faculty: s.faculty || 'Dr. Putti Jyothi',
    room: s.room || 'E-407',
    batch: s.batch || 'All Students',
    createdBy: s.createdBy || s.submitted_by || 'C.Rithvik',
    submitted_by: s.submitted_by || s.createdBy || 'C.Rithvik',
    crGroup: s.crGroup || 'CR',
    submitter_role: s.submitter_role || 'CR',
    presentCount,
    present_count: presentCount,
    absentCount,
    absent_count: absentCount,
    totalCount,
    total_students: totalCount,
    percentage,
    students
  };
}

export function getLocalSessions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    
    // Normalize all sessions
    const normalized = list.map(normalizeSession);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
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
    
    const rawSession = {
      id: sessionId,
      sessionId: sessionId,
      subject: payload.subject,
      courseCode: payload.courseCode || '-',
      course_code: payload.courseCode || '-',
      faculty: payload.faculty || '-',
      room: payload.room || '-',
      batch: payload.batch || 'All Students',
      date: payload.date || now.toISOString().split('T')[0],
      startTime: payload.startTime || '10:00 AM',
      start_time: payload.startTime || '10:00 AM',
      endTime: payload.endTime || '11:00 AM',
      end_time: payload.endTime || '11:00 AM',
      submitted_by: payload.submittedBy || 'C.Rithvik',
      createdBy: payload.submittedBy || 'C.Rithvik',
      submitter_role: 'CR',
      crGroup: 'CR',
      created_at: now.toISOString(),
      notes: payload.notes || '',
      students: payload.students || []
    };

    const newSession = normalizeSession(rawSession);

    // Check duplicate
    const isDuplicate = existing.some(s => 
      s.subject === newSession.subject && 
      s.date === newSession.date && 
      s.startTime === newSession.startTime &&
      s.batch === newSession.batch
    );

    if (isDuplicate) {
      const updated = existing.map(s => 
        (s.subject === newSession.subject && s.date === newSession.date && s.startTime === newSession.startTime && s.batch === newSession.batch)
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
    const filtered = existing.filter(s => String(s.id) !== String(sessionId) && String(s.sessionId) !== String(sessionId));
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
      if (String(s.id) === String(sessionId) || String(s.sessionId) === String(sessionId)) {
        return normalizeSession({ ...s, ...updatedData });
      }
      return s;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return true;
  } catch (e) {
    return false;
  }
}
