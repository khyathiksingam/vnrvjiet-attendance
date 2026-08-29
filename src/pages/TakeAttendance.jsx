import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { shareOnWhatsApp } from '../utils/whatsapp';
import { 
  CheckSquare, 
  Share2, 
  Printer, 
  RotateCcw, 
  Search, 
  UserCheck, 
  UserX, 
  Clock, 
  Calendar, 
  MapPin, 
  User, 
  Users, 
  AlertCircle, 
  CheckCircle2, 
  Save,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { STUDENTS, COURSES, TIMETABLE } from '../data/masterData';

export default function TakeAttendance({ setTab, preselectedPeriod, onAttendanceSaved }) {
  const { user } = useAuth();

  // Initialize initial map for all 74 students as PRESENT
  const defaultMap = {};
  STUDENTS.forEach(s => {
    defaultMap[s.rollNumber] = 'PRESENT';
  });

  const [students, setStudents] = useState(STUDENTS);
  const [attendanceMap, setAttendanceMap] = useState(defaultMap);
  const [coursesMeta, setCoursesMeta] = useState(COURSES);
  const [timetableMeta, setTimetableMeta] = useState(TIMETABLE);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('10:00 AM');
  const [endTime, setEndTime] = useState('11:00 AM');
  const [subject, setSubject] = useState('PSA');
  const [courseCode, setCourseCode] = useState('25BSMT204');
  const [faculty, setFaculty] = useState('Dr. Ch Shashi Kumar');
  const [room, setRoom] = useState('E-407');
  const [batch, setBatch] = useState('All Students'); // 'All Students' | 'Batch 1' | 'Batch 2'
  const [isBatchSeparated, setIsBatchSeparated] = useState(false);
  const [notes, setNotes] = useState('');

  // Feedback states
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Load students and courses metadata
  useEffect(() => {
    Promise.all([
      fetch('/api/students').then(r => r.ok ? r.json() : null),
      fetch('/api/timetable').then(r => r.ok ? r.json() : null),
      fetch('/api/timetable/current').then(r => r.ok ? r.json() : null)
    ])
      .then(([stuData, ttData, curData]) => {
        if (stuData && Array.isArray(stuData.students) && stuData.students.length > 0) {
          setStudents(stuData.students);
          const initialMap = {};
          stuData.students.forEach(s => {
            initialMap[s.rollNumber] = 'PRESENT';
          });
          setAttendanceMap(initialMap);
        }
        if (ttData) {
          if (ttData.courses) setCoursesMeta(ttData.courses);
          if (ttData.timetable) setTimetableMeta(ttData.timetable);
        }

        // Auto-select preselected or currently running class
        const target = preselectedPeriod || (curData && curData.currentPeriod && curData.currentPeriod.isAttendanceRequired ? curData.currentPeriod : null);
        if (target) {
          applyPeriod(target, ttData?.courses || COURSES);
        }
      })
      .catch(err => {
        console.log('Attendance metadata synced from local master:', err);
      });
  }, [preselectedPeriod]);

  const applyPeriod = (period, courses = coursesMeta) => {
    setStartTime(period.startTime || '10:00 AM');
    setEndTime(period.endTime || '11:00 AM');

    if (period.hasBatchSplit && period.batchDetails) {
      setIsBatchSeparated(true);
      setBatch('Batch 1'); // default to Batch 1 for split periods
      const b1 = period.batchDetails['Batch 1'];
      setSubject(b1.subject);
      setCourseCode(b1.courseCode);
      setFaculty(b1.faculty);
      setRoom(b1.room);
    } else {
      setIsBatchSeparated(false);
      setBatch('All Students');
      setSubject(period.subject);
      setCourseCode(period.courseCode);
      setFaculty(period.faculty);
      setRoom(period.room);
    }
  };

  // Handle subject change from dropdown
  const handleSubjectChange = (newSubject) => {
    setSubject(newSubject);
    const info = coursesMeta[newSubject];
    if (info) {
      setCourseCode(info.code);
      setFaculty(Array.isArray(info.faculty) ? info.faculty.join(', ') : info.faculty);
      setRoom(info.room);
    }
  };

  // Filter students based on Batch and Search Query
  const displayedStudents = students.filter(s => {
    // Batch filter
    if (batch === 'Batch 1' && s.batch !== 'Batch 1') return false;
    if (batch === 'Batch 2' && s.batch !== 'Batch 2') return false;

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchRoll = s.rollNumber.toLowerCase().includes(q);
      const matchName = s.name.toLowerCase().includes(q);
      return matchRoll || matchName;
    }
    return true;
  });

  // Calculate Live Statistics
  const applicableStudents = students.filter(s => {
    if (batch === 'Batch 1') return s.batch === 'Batch 1';
    if (batch === 'Batch 2') return s.batch === 'Batch 2';
    return true;
  });

  const totalCount = applicableStudents.length;
  const presentStudents = applicableStudents.filter(s => attendanceMap[s.rollNumber] === 'PRESENT');
  const absentStudents = applicableStudents.filter(s => attendanceMap[s.rollNumber] === 'ABSENT');
  const presentCount = presentStudents.length;
  const absentCount = absentStudents.length;
  const attendancePercentage = totalCount > 0 ? Number(((presentCount / totalCount) * 100).toFixed(1)) : 100;

  // Toggle single student status
  const toggleStatus = (rollNumber) => {
    setAttendanceMap(prev => ({
      ...prev,
      [rollNumber]: prev[rollNumber] === 'PRESENT' ? 'ABSENT' : 'PRESENT'
    }));
  };

  // Mark all applicable present
  const handleMarkAllPresent = () => {
    setAttendanceMap(prev => {
      const next = { ...prev };
      applicableStudents.forEach(s => {
        next[s.rollNumber] = 'PRESENT';
      });
      return next;
    });
  };

  // Clear all (Mark all absent)
  const handleClearAll = () => {
    setAttendanceMap(prev => {
      const next = { ...prev };
      applicableStudents.forEach(s => {
        next[s.rollNumber] = 'ABSENT';
      });
      return next;
    });
  };

  // Reset form
  const handleReset = () => {
    setDate(new Date().toISOString().split('T')[0]);
    handleMarkAllPresent();
    setSuccessMessage('');
    setErrorMessage('');
    setNotes('');
  };

  // Save Attendance to Backend SQLite
  const handleSaveAttendance = async () => {
    setSaving(true);
    setSuccessMessage('');
    setErrorMessage('');

    const token = sessionStorage.getItem('vnr_token');
    const payload = {
      date,
      startTime,
      endTime,
      subject,
      courseCode,
      faculty,
      room,
      batch,
      notes,
      students: applicableStudents.map(s => ({
        rollNumber: s.rollNumber,
        status: attendanceMap[s.rollNumber] || 'PRESENT'
      }))
    };

    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save attendance.');
      }

      setSuccessMessage(`Attendance saved successfully! Session ID: ${data.sessionId}`);
      
      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}

      if (onAttendanceSaved) onAttendanceSaved();
    } catch (err) {
      setErrorMessage(err.message || 'Error saving attendance');
    } finally {
      setSaving(false);
    }
  };

  // Share on WhatsApp
  const handleWhatsAppShare = () => {
    shareOnWhatsApp({
      subject,
      courseCode,
      faculty,
      room,
      batch,
      date,
      startTime,
      endTime,
      presentStudents,
      absentStudents
    });
  };

  // Trigger Print
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Attendance Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 shadow-xs border border-slate-200 dark:border-slate-800 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              {setTab && (
                <button
                  onClick={() => setTab('dashboard')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Dashboard</span>
                </button>
              )}
              <span className="px-2.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 text-xs font-bold uppercase">
                TAKE ATTENDANCE
              </span>
              <span className="hidden sm:inline text-xs text-slate-500 dark:text-slate-400">
                CSE-CYS | II Year | I Semester | Section B
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
              VNR VJIET - CLASS ATTENDANCE
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select timetable subject or custom batch to record attendance
            </p>
          </div>

          {/* Quick Counter Badges */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <div className="px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-center min-w-[70px]">
              <div className="text-xs font-bold uppercase">Present</div>
              <div className="text-xl font-extrabold">{presentCount}</div>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-800 dark:text-red-300 text-center min-w-[70px]">
              <div className="text-xs font-bold uppercase">Absent</div>
              <div className="text-xl font-extrabold">{absentCount}</div>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-blue-800 dark:text-blue-300 text-center min-w-[70px]">
              <div className="text-xs font-bold uppercase">Total</div>
              <div className="text-xl font-extrabold">{totalCount}</div>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60 text-purple-800 dark:text-purple-300 text-center min-w-[75px]">
              <div className="text-xs font-bold uppercase">Rate</div>
              <div className="text-xl font-extrabold">{attendancePercentage}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Success / Error Messages */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/60 flex items-center justify-between text-emerald-800 dark:text-emerald-200 text-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span className="font-medium">{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage('')} className="text-xs font-bold underline ml-4">
            Dismiss
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 flex items-center justify-between text-red-800 dark:text-red-200 text-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="font-medium">{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage('')} className="text-xs font-bold underline ml-4">
            Dismiss
          </button>
        </div>
      )}

      {/* Class Configuration Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 shadow-xs border border-slate-200 dark:border-slate-800 transition-colors">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-600" />
          <span>Class Details & Timetable Selection</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Subject Dropdown */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Subject
            </label>
            <select
              value={subject}
              onChange={(e) => handleSubjectChange(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-semibold focus:ring-2 focus:ring-blue-600 transition-colors"
            >
              {Object.keys(coursesMeta).map(sub => (
                <option key={sub} value={sub}>{sub} - {coursesMeta[sub].name}</option>
              ))}
            </select>
          </div>

          {/* Batch Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Batch Selection
            </label>
            <select
              value={batch}
              onChange={(e) => setBatch(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-semibold focus:ring-2 focus:ring-blue-600 transition-colors"
            >
              <option value="All Students">All Students (74 Students)</option>
              <option value="Batch 1">Batch 1 Only (37 Students)</option>
              <option value="Batch 2">Batch 2 Only (37 Students)</option>
            </select>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Date (DD-MM-YYYY)
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-blue-600 transition-colors"
            />
          </div>

          {/* Time Block */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Time Slot
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                placeholder="10:00 AM"
                className="w-1/2 px-2.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-blue-600 transition-colors"
              />
              <span className="text-slate-400 font-bold">–</span>
              <input
                type="text"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                placeholder="11:00 AM"
                className="w-1/2 px-2.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-blue-600 transition-colors"
              />
            </div>
          </div>

        </div>

        {/* Dynamic Details Strip */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <span className="text-slate-500 dark:text-slate-400 block font-medium">Course Code</span>
            <strong className="text-slate-800 dark:text-slate-200 font-mono text-sm">{courseCode}</strong>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <span className="text-slate-500 dark:text-slate-400 block font-medium">Faculty</span>
            <strong className="text-slate-800 dark:text-slate-200 text-sm truncate block">{faculty}</strong>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <span className="text-slate-500 dark:text-slate-400 block font-medium">Room Number</span>
            <strong className="text-blue-700 dark:text-blue-400 text-sm font-bold">{room}</strong>
          </div>
        </div>

      </div>

      {/* Toolbar & Student Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student name or roll number..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm placeholder-slate-400 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
          />
        </div>

        {/* Quick Batch Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkAllPresent}
            className="flex-1 sm:flex-none px-3.5 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
          >
            <UserCheck className="w-4 h-4" />
            Mark All Present
          </button>
          <button
            onClick={handleClearAll}
            className="flex-1 sm:flex-none px-3.5 py-2 text-xs font-semibold rounded-xl bg-red-600 hover:bg-red-700 text-white transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
          >
            <UserX className="w-4 h-4" />
            Clear All
          </button>
        </div>

      </div>

      {/* Student Roster Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xs border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
        <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Student Roster ({displayedStudents.length} Students Listed)
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Click status button to toggle Present / Absent
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                <th className="py-3 px-4 w-12 text-center">S.No</th>
                <th className="py-3 px-4 w-36">Full Roll Number</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4 w-28 text-center">Batch</th>
                <th className="py-3 px-4 w-40 text-center">Attendance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm">
              {displayedStudents.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-400">
                    No students match the current filter or search criteria.
                  </td>
                </tr>
              ) : (
                displayedStudents.map((student) => {
                  const isPresent = attendanceMap[student.rollNumber] === 'PRESENT';

                  return (
                    <tr
                      key={student.rollNumber}
                      onClick={() => toggleStatus(student.rollNumber)}
                      className={`cursor-pointer transition-colors ${
                        isPresent
                          ? 'hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20'
                          : 'bg-red-50/30 dark:bg-red-950/20 hover:bg-red-50/60 dark:hover:bg-red-950/30'
                      }`}
                    >
                      <td className="py-3 px-4 text-center font-mono text-xs text-slate-400">
                        {student.sNo}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-slate-100">
                        {student.rollNumber}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">
                        {student.name}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                          student.batch === 'Batch 1'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300'
                            : 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300'
                        }`}>
                          {student.batch}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => toggleStatus(student.rollNumber)}
                          className={`w-28 py-1.5 px-3 rounded-xl text-xs font-bold tracking-wider transition-all shadow-2xs ${
                            isPresent
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-500/20'
                              : 'bg-red-600 hover:bg-red-700 text-white ring-2 ring-red-500/20'
                          }`}
                        >
                          {isPresent ? '✓ PRESENT' : '✗ ABSENT'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Bottom Sticky Action Bar */}
      <div className="sticky bottom-4 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 transition-colors">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          
          <div className="text-xs text-slate-600 dark:text-slate-400 text-center sm:text-left">
            <span className="font-semibold text-slate-900 dark:text-white">Summary: </span>
            <span className="text-emerald-600 font-bold">{presentCount} Present</span> •{' '}
            <span className="text-red-600 font-bold">{absentCount} Absent</span> of {totalCount} Students ({attendancePercentage}%)
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center w-full sm:w-auto">
            
            {/* Reset Button */}
            <button
              onClick={handleReset}
              className="px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>

            {/* WhatsApp Share Button */}
            <button
              onClick={handleWhatsAppShare}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Share on WhatsApp
            </button>

            {/* Save Attendance Button */}
            <button
              onClick={handleSaveAttendance}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Attendance'}
            </button>

          </div>

        </div>
      </div>

    </div>
  );
}
