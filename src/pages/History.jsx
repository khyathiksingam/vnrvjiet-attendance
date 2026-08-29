import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { shareOnWhatsApp } from '../utils/whatsapp';
import ConfirmDialog from '../components/ConfirmDialog';
import { 
  History as HistoryIcon, 
  Search, 
  Filter, 
  Share2, 
  Printer, 
  Edit3, 
  Trash2, 
  Eye, 
  Calendar, 
  Clock, 
  Shield, 
  User, 
  CheckCircle2, 
  XCircle,
  X,
  Save,
  ArrowLeft,
  Check,
  Building2,
  Users
} from 'lucide-react';
import { getLocalSessions, deleteLocalSession, updateLocalSession, normalizeSession } from '../utils/storage';
import { STUDENTS } from '../data/masterData';

export default function History({ setTab }) {
  const { user, isCentralMember } = useAuth();
  
  const [sessions, setSessions] = useState(() => getLocalSessions());
  const [loading, setLoading] = useState(false);

  // Filters
  const [subjectFilter, setSubjectFilter] = useState('ALL');
  const [batchFilter, setBatchFilter] = useState('ALL');
  const [crFilter, setCrFilter] = useState('ALL');
  const [groupFilter, setGroupFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modals state
  const [editSessionData, setEditSessionData] = useState(null);
  const [deleteSessionId, setDeleteSessionId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchStudent, setSearchStudent] = useState('');

  const fetchHistory = () => {
    setLoading(true);
    const token = sessionStorage.getItem('vnr_token');
    
    let url = '/api/attendance?';
    if (subjectFilter !== 'ALL') url += `&subject=${encodeURIComponent(subjectFilter)}`;
    if (batchFilter !== 'ALL') url += `&batch=${encodeURIComponent(batchFilter)}`;
    if (crFilter !== 'ALL') url += `&cr=${encodeURIComponent(crFilter)}`;
    if (groupFilter !== 'ALL') url += `&group=${encodeURIComponent(groupFilter)}`;
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;

    fetch(url)
      .then(r => r.ok ? r.json() : { sessions: [] })
      .then(data => {
        let apiList = (data.sessions || []).map(normalizeSession);
        const localList = getLocalSessions();
        
        // Merge without duplicates by ID
        const mergedMap = new Map();
        [...localList, ...apiList].forEach(s => {
          if (s) {
            const sid = String(s.sessionId || s.id);
            mergedMap.set(sid, s);
          }
        });
        let combined = Array.from(mergedMap.values());

        // Apply client filters
        if (subjectFilter !== 'ALL') combined = combined.filter(s => s.subject === subjectFilter);
        if (batchFilter !== 'ALL') combined = combined.filter(s => s.batch === batchFilter);
        if (startDate) combined = combined.filter(s => s.date >= startDate);
        if (endDate) combined = combined.filter(s => s.date <= endDate);

        setSessions(combined);
      })
      .catch(err => {
        console.log('Using local sessions:', err);
        let localList = getLocalSessions();
        if (subjectFilter !== 'ALL') localList = localList.filter(s => s.subject === subjectFilter);
        if (batchFilter !== 'ALL') localList = localList.filter(s => s.batch === batchFilter);
        if (startDate) localList = localList.filter(s => s.date >= startDate);
        if (endDate) localList = localList.filter(s => s.date <= endDate);
        setSessions(localList);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchHistory();
  }, [subjectFilter, batchFilter, crFilter, groupFilter, startDate, endDate]);

  // Open Preview / Edit Modal
  const handleOpenEdit = (sessionId) => {
    const sidStr = String(sessionId);
    const token = sessionStorage.getItem('vnr_token');
    
    // Check local sessions first
    const local = getLocalSessions().find(s => String(s.id) === sidStr || String(s.sessionId) === sidStr);
    if (local) {
      const records = (local.students && local.students.length > 0)
        ? local.students.map(st => ({
            rollNumber: st.rollNumber,
            studentName: st.name || st.studentName || st.rollNumber,
            status: st.status || 'PRESENT'
          }))
        : STUDENTS.map(st => ({
            rollNumber: st.rollNumber,
            studentName: st.name,
            status: 'PRESENT'
          }));

      setEditSessionData({
        session: {
          sessionId: local.id || local.sessionId,
          subject: local.subject,
          courseCode: local.courseCode || local.course_code,
          faculty: local.faculty,
          room: local.room,
          batch: local.batch,
          date: local.date,
          startTime: local.startTime || local.start_time,
          endTime: local.endTime || local.end_time,
          notes: local.notes,
          presentCount: local.presentCount,
          totalCount: local.totalCount,
          percentage: local.percentage
        },
        records
      });
      return;
    }

    fetch(`/api/attendance/${sessionId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setEditSessionData(data);
        }
      })
      .catch(err => console.error(err));
  };

  // Toggle student status in edit modal
  const handleToggleEditStatus = (rollNumber) => {
    if (!editSessionData) return;

    setEditSessionData(prev => {
      const updatedRecords = prev.records.map(r => {
        if (r.rollNumber === rollNumber) {
          return { ...r, status: r.status === 'PRESENT' ? 'ABSENT' : 'PRESENT' };
        }
        return r;
      });

      const pres = updatedRecords.filter(r => r.status === 'PRESENT').length;
      const tot = updatedRecords.length;
      const pct = tot > 0 ? Math.round((pres / tot) * 100) : 100;

      return {
        ...prev,
        session: {
          ...prev.session,
          presentCount: pres,
          totalCount: tot,
          percentage: pct
        },
        records: updatedRecords
      };
    });
  };

  // Save edited attendance
  const handleSaveEditedAttendance = async () => {
    if (!editSessionData) return;
    const token = sessionStorage.getItem('vnr_token');
    const sid = editSessionData.session.sessionId;

    // Update local storage
    updateLocalSession(sid, {
      students: editSessionData.records.map(r => ({
        rollNumber: r.rollNumber,
        name: r.studentName,
        status: r.status
      })),
      presentCount: editSessionData.records.filter(r => r.status === 'PRESENT').length,
      absentCount: editSessionData.records.filter(r => r.status === 'ABSENT').length
    });

    try {
      await fetch(`/api/attendance/${sid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          students: editSessionData.records.map(r => ({
            rollNumber: r.rollNumber,
            status: r.status
          }))
        })
      });
    } catch (err) {}

    setEditSessionData(null);
    fetchHistory();
  };

  // Delete Attendance
  const handleConfirmDelete = async () => {
    if (!deleteSessionId) return;
    setIsDeleting(true);
    const token = sessionStorage.getItem('vnr_token');

    // Delete locally
    deleteLocalSession(deleteSessionId);

    try {
      await fetch(`/api/attendance/${deleteSessionId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {}

    setIsDeleting(false);
    setDeleteSessionId(null);
    fetchHistory();
  };

  // Share session
  const handleShareSession = (s) => {
    const norm = normalizeSession(s);
    const dateFormatted = norm.date;
    const timeFormatted = `${norm.startTime} – ${norm.endTime}`;
    
    // Find absentees
    let absentees = [];
    if (norm.students && norm.students.length > 0) {
      absentees = norm.students
        .filter(st => st.status === 'ABSENT')
        .map(st => ({
          rollNumber: st.rollNumber,
          name: st.name || st.studentName || st.rollNumber
        }));
    }

    const payload = {
      subject: norm.subject,
      courseCode: norm.courseCode,
      faculty: norm.faculty,
      batch: norm.batch,
      date: dateFormatted,
      time: timeFormatted,
      totalStudents: norm.totalCount || 74,
      presentCount: norm.presentCount || 0,
      absentCount: norm.absentCount || 0,
      percentage: norm.percentage || 100,
      absentees: absentees,
      submittedBy: norm.createdBy || 'C.Rithvik'
    };

    shareOnWhatsApp(payload);
  };

  const filteredModalRecords = useMemo(() => {
    if (!editSessionData || !editSessionData.records) return [];
    if (!searchStudent.trim()) return editSessionData.records;
    const q = searchStudent.toLowerCase();
    return editSessionData.records.filter(r => 
      r.rollNumber.toLowerCase().includes(q) || 
      (r.studentName && r.studentName.toLowerCase().includes(q))
    );
  }, [editSessionData, searchStudent]);

  return (
    <div className="space-y-6 animate-in fade-in transition-colors">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTab('dashboard')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Dashboard
            </button>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 text-xs font-bold uppercase tracking-wider">
              ATTENDANCE HISTORY
            </span>
            <span className="hidden sm:inline text-xs text-slate-500 dark:text-slate-400">
              CSE-CYS | II Year | I Semester | Section B
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            Attendance History & WhatsApp Sharing
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Review, edit, delete, and share previously recorded attendance sessions with original timestamps.
          </p>
        </div>

        <div className="px-4 py-2 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-200 text-center shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider">SESSIONS FOUND</div>
          <div className="text-2xl font-extrabold">{sessions.length}</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
          <Filter className="w-4 h-4 text-blue-600" />
          <span>Filters</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Subject Filter */}
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Subject</label>
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
            >
              <option value="ALL">All Subjects</option>
              <option value="PSA">PSA</option>
              <option value="OOPJ">OOPJ</option>
              <option value="CN">CN</option>
              <option value="OS">OS</option>
              <option value="DT">DT</option>
              <option value="CM LAB">CM LAB</option>
              <option value="OOPJ LAB">OOPJ LAB</option>
              <option value="CN LAB">CN LAB</option>
              <option value="OS LAB">OS LAB</option>
              <option value="CF LAB">CF LAB</option>
              <option value="CF">CF</option>
              <option value="DV LAB">DV LAB</option>
              <option value="ES">ES</option>
            </select>
          </div>

          {/* Batch Filter */}
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Batch</label>
            <select
              value={batchFilter}
              onChange={(e) => setBatchFilter(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
            >
              <option value="ALL">All Batches</option>
              <option value="All Students">All Students (74)</option>
              <option value="Batch 1">Batch 1 Only (37)</option>
              <option value="Batch 2">Batch 2 Only (37)</option>
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">From Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">To Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

        </div>
      </div>

      {/* Sessions Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-600 dark:text-slate-400 text-[11px] uppercase tracking-wider font-bold">
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Faculty & Room</th>
                <th className="py-3 px-4 text-center">Batch</th>
                <th className="py-3 px-4">Recorded By</th>
                <th className="py-3 px-4 text-center">Present / Total</th>
                <th className="py-3 px-4 text-center">Rate</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {sessions.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    <HistoryIcon className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2 opacity-50" />
                    <p className="font-semibold text-sm">No attendance records found matching filters.</p>
                    <p className="text-xs text-slate-400 mt-1">Take attendance from the timetable or quick action button.</p>
                  </td>
                </tr>
              ) : (
                sessions.map(s => {
                  const norm = normalizeSession(s);
                  const sid = norm.id || norm.sessionId;
                  const pct = norm.percentage;
                  
                  return (
                    <tr key={sid} className="hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">{norm.date}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">{norm.startTime} – {norm.endTime}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">{norm.subject}</div>
                        <div className="font-mono text-[11px] text-slate-500 dark:text-slate-400">{norm.courseCode}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-slate-800 dark:text-slate-200 text-xs font-semibold">{norm.faculty}</div>
                        <div className="text-[11px] text-blue-600 dark:text-blue-400 font-bold">Room: {norm.room}</div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                          norm.batch === 'Batch 1'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300'
                            : norm.batch === 'Batch 2'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300'
                            : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
                        }`}>
                          {norm.batch}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800 dark:text-slate-200">{norm.createdBy}</div>
                        <div className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">{norm.crGroup}</div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">{norm.presentCount}</span>
                        <span className="text-slate-400 font-bold"> / </span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">{norm.totalCount}</span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className={`font-extrabold text-xs px-2 py-0.5 rounded-full ${
                          pct >= 75 
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' 
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                        }`}>
                          {pct}%
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          
                          {/* View & Edit */}
                          <button
                            onClick={() => handleOpenEdit(sid)}
                            title="View / Edit Session"
                            className="p-2 rounded-xl text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* WhatsApp Share */}
                          <button
                            onClick={() => handleShareSession(norm)}
                            title="Share on WhatsApp"
                            className="p-2 rounded-xl text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>

                          {/* Delete Session */}
                          <button
                            onClick={() => setDeleteSessionId(sid)}
                            title="Delete Session"
                            className="p-2 rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / View Modal */}
      {editSessionData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-850 shrink-0">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Attendance: {editSessionData.session.subject}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 font-bold">
                    {editSessionData.session.batch}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {editSessionData.session.date} • {editSessionData.session.startTime} – {editSessionData.session.endTime} • {editSessionData.session.faculty} (Room: {editSessionData.session.room})
                </p>
              </div>
              <button
                onClick={() => setEditSessionData(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Stats Banner */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-blue-50/50 dark:bg-blue-950/20 grid grid-cols-3 gap-2 text-center shrink-0">
              <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs">
                <div className="text-[11px] font-bold text-slate-500 uppercase">Present</div>
                <div className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                  {editSessionData.records.filter(r => r.status === 'PRESENT').length}
                </div>
              </div>
              <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs">
                <div className="text-[11px] font-bold text-slate-500 uppercase">Absent</div>
                <div className="text-lg font-extrabold text-red-600 dark:text-red-400">
                  {editSessionData.records.filter(r => r.status === 'ABSENT').length}
                </div>
              </div>
              <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs">
                <div className="text-[11px] font-bold text-slate-500 uppercase">Attendance Rate</div>
                <div className="text-lg font-extrabold text-blue-600 dark:text-blue-400">
                  {editSessionData.records.length > 0 
                    ? Math.round((editSessionData.records.filter(r => r.status === 'PRESENT').length / editSessionData.records.length) * 100) 
                    : 100}%
                </div>
              </div>
            </div>

            {/* Search Student */}
            <div className="p-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search by Roll No or Student Name..."
                  value={searchStudent}
                  onChange={(e) => setSearchStudent(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Students Table */}
            <div className="overflow-y-auto p-4 flex-1">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 font-bold uppercase text-[11px]">
                    <th className="py-2 px-3">S.No</th>
                    <th className="py-2 px-3">Roll No</th>
                    <th className="py-2 px-3">Student Name</th>
                    <th className="py-2 px-3 text-center">Status</th>
                    <th className="py-2 px-3 text-right">Toggle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredModalRecords.map((r, idx) => {
                    const isLE = r.rollNumber.startsWith('26075A');
                    const isPres = r.status === 'PRESENT';

                    return (
                      <tr key={r.rollNumber} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                        <td className="py-2.5 px-3 font-mono text-slate-500 font-bold">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900 dark:text-white">
                          <span className="flex items-center gap-1.5">
                            {r.rollNumber}
                            {isLE && (
                              <span className="text-[10px] px-1 py-0.2 rounded bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 font-extrabold">
                                LE
                              </span>
                            )}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-800 dark:text-slate-200">{r.studentName}</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center justify-center gap-1 w-fit mx-auto ${
                            isPres 
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' 
                              : 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                          }`}>
                            {isPres ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            <span>{r.status}</span>
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => handleToggleEditStatus(r.rollNumber)}
                            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shadow-2xs ${
                              isPres
                                ? 'bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-600 border border-red-200 dark:border-red-900'
                                : 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-200 dark:border-emerald-900'
                            }`}
                          >
                            Mark {isPres ? 'Absent' : 'Present'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-850 shrink-0">
              <button
                onClick={() => handleShareSession(editSessionData.session)}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-md"
              >
                <Share2 className="w-4 h-4" />
                Share WhatsApp
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditSessionData(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300"
                >
                  Close
                </button>
                <button
                  onClick={handleSaveEditedAttendance}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 shadow-md"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteSessionId}
        title="Delete Attendance Session"
        message="Are you sure you want to permanently delete this attendance session? This action cannot be undone."
        confirmText={isDeleting ? 'Deleting...' : 'Delete Session'}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteSessionId(null)}
      />

    </div>
  );
}
