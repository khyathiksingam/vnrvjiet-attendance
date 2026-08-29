import express from 'express';
import { TIMETABLE, COURSES, COLLEGE_INFO } from '../data/masterData.js';
import { authenticateToken } from '../auth.js';

const router = express.Router();

const DAYS_MAP = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Helper to convert HH:MM AM/PM to minutes from midnight
function timeToMinutes(timeStr) {
  const [time, period] = timeStr.trim().split(' ');
  const [hoursStr, minutesStr] = time.split(':');
  let hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

// GET /api/timetable
router.get('/', authenticateToken, (req, res) => {
  res.json({
    collegeInfo: COLLEGE_INFO,
    timetable: TIMETABLE,
    courses: COURSES
  });
});

// GET /api/timetable/current - determine current running class and today's schedule
router.get('/current', authenticateToken, (req, res) => {
  const now = new Date();
  const dayName = req.query.day || DAYS_MAP[now.getDay()];
  
  // Calculate current minutes from midnight in local time
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentTotalMinutes = currentHours * 60 + currentMinutes;

  const todaySchedule = TIMETABLE[dayName] || [];
  let currentPeriod = null;
  let nextPeriod = null;

  for (let i = 0; i < todaySchedule.length; i++) {
    const period = todaySchedule[i];
    const startM = period.startMinutes || timeToMinutes(period.startTime);
    const endM = period.endMinutes || timeToMinutes(period.endTime);

    if (currentTotalMinutes >= startM && currentTotalMinutes < endM) {
      currentPeriod = period;
      if (i + 1 < todaySchedule.length) {
        nextPeriod = todaySchedule[i + 1];
      }
      break;
    } else if (currentTotalMinutes < startM && !nextPeriod) {
      nextPeriod = period;
    }
  }

  res.json({
    day: dayName,
    currentTime: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
    currentTotalMinutes,
    todaySchedule,
    currentPeriod,
    nextPeriod,
    isClassRunning: currentPeriod && currentPeriod.isAttendanceRequired
  });
});

export default router;
