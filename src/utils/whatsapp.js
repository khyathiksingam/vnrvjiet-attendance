/**
 * WhatsApp Message Generator & Sharing Utility
 * Strictly follows VNR VJIET Class Attendance specifications:
 * - Semester: III
 * - No student names
 * - Only LAST 2 CHARACTERS of full roll number (e.g. 25071A6268 -> 68, 26075A6207 -> 07)
 * - Single continuous comma-separated list without line breaks inside roll lists
 * - No symbols (no checkmarks, no boxes)
 * - Preserves leading zeros (07, 08, 09) and hex digits (A0..D3)
 */

export function extractShortRoll(rollNumber) {
  if (!rollNumber) return '';
  const clean = rollNumber.trim().toUpperCase();
  return clean.slice(-2);
}

export function getRollSortIndex(rollNumber) {
  if (!rollNumber) return 9999;
  const roll = rollNumber.trim().toUpperCase();

  // If 25071A62xx
  if (roll.startsWith('25071A62')) {
    const end = roll.slice(-2);
    // If numeric 68..99
    if (/^\d+$/.test(end)) {
      return parseInt(end, 10); // 68..99
    }
    // If hex A0..D3
    const firstChar = end.charAt(0);
    const secondChar = end.charAt(1);
    const letterBase = { 'A': 100, 'B': 110, 'C': 120, 'D': 130 };
    if (letterBase[firstChar] !== undefined) {
      return letterBase[firstChar] + parseInt(secondChar, 10);
    }
  }

  // If lateral entry 26075A62xx (07..14)
  if (roll.startsWith('26075A62')) {
    const end = roll.slice(-2);
    return 200 + parseInt(end, 10); // 207..214
  }

  return 9999;
}

export function formatDateToDDMMYYYY(dateStr) {
  if (!dateStr) return '';
  // If already DD-MM-YYYY
  if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) return dateStr;
  
  // If YYYY-MM-DD
  const parts = dateStr.split('-');
  if (parts.length === 3 && parts[0].length === 4) {
    return `${parts[2].padStart(2, '0')}-${parts[1].padStart(2, '0')}-${parts[0]}`;
  }
  
  try {
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  } catch (e) {
    return dateStr;
  }
}

export function generateWhatsAppMessage({
  subject,
  courseCode,
  faculty,
  room,
  batch,
  date,
  startTime,
  endTime,
  presentStudents = [], // array of objects with rollNumber or strings
  absentStudents = []
}) {
  const formattedDate = formatDateToDDMMYYYY(date);
  const timeString = endTime ? `${startTime} – ${endTime}` : startTime;

  const getRollStr = (s) => (typeof s === 'string' ? s : (s.rollNumber || s.student_roll || s.roll || ''));

  // Sort according to canonical VNR roll sequence: 25071A62* (68..99, A0..D3), then 26075A62* (07..14)
  const sortedPresent = [...presentStudents].sort((a, b) => getRollSortIndex(getRollStr(a)) - getRollSortIndex(getRollStr(b)));
  const sortedAbsent = [...absentStudents].sort((a, b) => getRollSortIndex(getRollStr(a)) - getRollSortIndex(getRollStr(b)));

  // Extract 2-char short roll numbers as strings
  const presentShortRolls = sortedPresent.map(s => extractShortRoll(getRollStr(s))).filter(Boolean);
  const absentShortRolls = sortedAbsent.map(s => extractShortRoll(getRollStr(s))).filter(Boolean);

  const presentCount = presentShortRolls.length;
  const absentCount = absentShortRolls.length;
  const totalCount = presentCount + absentCount;

  // Format batch display
  let batchDisplay = 'All Students';
  if (batch === 'Batch 1' || batch === '1st Batch') batchDisplay = '1st Batch';
  else if (batch === 'Batch 2' || batch === '2nd Batch') batchDisplay = '2nd Batch';
  else if (batch) batchDisplay = batch;

  // ONE CONTINUOUS COMMA-SEPARATED LIST
  const presentListText = presentShortRolls.join(', ');
  const absentListText = absentShortRolls.length > 0 ? absentShortRolls.join(', ') : '';

  const lines = [
    'VNR VJIET - CLASS ATTENDANCE',
    'CSE-CYS | II Year | III Semester | Section B',
    '',
    `Subject: ${subject || 'N/A'}`,
    `Course Code: ${courseCode || 'N/A'}`,
    `Faculty: ${faculty || 'N/A'}`,
    `Batch: ${batchDisplay}`,
    `Room: ${room || 'N/A'}`,
    '',
    `Date: ${formattedDate}`,
    `Time: ${timeString}`,
    '',
    `Present (${presentCount}):`,
    presentListText,
    '',
    `Absent (${absentCount}):`,
    absentListText,
    '',
    `Total: ${totalCount}`
  ];

  return lines.join('\n');
}

export function shareOnWhatsApp(attendanceData) {
  const message = generateWhatsAppMessage(attendanceData);
  const encoded = encodeURIComponent(message);
  
  // Detect mobile device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  const url = isMobile 
    ? `https://api.whatsapp.com/send?text=${encoded}`
    : `https://web.whatsapp.com/send?text=${encoded}`;

  window.open(url, '_blank', 'noopener,noreferrer');
}
