import React, { useState, useEffect } from 'react';
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
  ArrowLeft
} from 'lucide-react';
import { getLocalSessions, deleteLocalSession, updateLocalSession } from '../utils/storage';

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
  const [viewSessionId, setViewSessionId] = useState(null);
  const [editSessionData, setEditSessionData] = useState(null);
  const [deleteSessionId, setDeleteSessionId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
        let apiList = data.sessions || [];
        const localList = getLocalSessions();
        
        // Merge without duplicates by ID
        const mergedMap = new Map();
        [...localList, ...apiList].forEach(s => {
          mergedMap.set(String(s.id || s.sessionId), s);
        });
        let combined = Array.from(mergedMap.values());

        // Apply client filters if local records exist
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

  // Open Edit / View Modal
  const handleOpenEdit = (sessionId) => {
    const token = sessionStorage.getItem('vnr_token');
    
    // Check local sessions first
    const local = getLocalSessions().find(s => String(s.id) === String(sessionId));
    if (local) {
      setEditSessionData({
        session: {
          sessionId: local.id,
          subject: local.subject,
          courseCode: local.course_code,
          faculty: local.faculty,
          room: local.room,
          batch: local.batch,
          date: local.date,
          startTime: local.start_time,
          endTime: local.end_time,
          notes: local.notes
        },
        records: (local.students || []).map(s => ({
          rollNumber: s.rollNumber,
          studentName: s.name || s.rollNumber,
          status: s.status
        }))
      });
      return;
    }

    fetch(`/api/attendance/${sessionId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        setEditSessionData(data);
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
      return { ...prev, records: updatedRecords };
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
        status: r.status
      }))
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

    setDeleteSessionId(null);
    setIsDeleting(false);
    fetchHistory();
  };

  // WhatsApp Share using original session data
  const handleShareSession = async (session) => {
    const token = sessionStorage.getItem('vnr_token');
    
    // Check local session
    const local = getLocalSessions().find(s => String(s.id) === String(session.id || session.sessionId));
    if (local && local.students) {
      const presentStudents = local.students.filter(r => r.status === 'PRESENT');
      const absentStudents = local.students.filter(r => r.status === 'ABSENT');
      shareOnWhatsApp({
        subject: local.subject,
        courseCode: local.course_code,
        faculty: local.faculty,
        room: local.room,
        batch: local.batch,
        date: local.date,
        startTime: local.start_time,
        endTime: local.end_time,
        presentStudents,
        absentStudents
      });
      return;
    }

    try {
      const res = await fetch(`/api/attendance/${session.sessionId || session.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const presentStudents = (data.records || []).filter(r => r.status === 'PRESENT');
        const absentStudents = (data.records || []).filter(r => r.status === 'ABSENT');
        shareOnWhatsApp({
          subject: data.session.subject,
          courseCode: data.session.courseCode,
          faculty: data.session.faculty,
          room: data.session.room,
          batch: data.session.batch,
          date: data.session.date,
          startTime: data.session.startTime,
          endTime: data.session.endTime,
          presentStudents,
          absentStudents
        });
      }
    } catch (e) {}
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xs border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
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

        <div className="px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-200 text-center">
          <div className="text-xs font-bold uppercase">Sessions Found</div>
          <div className="text-xl font-extrabold">{sessions.length}</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
          <Filter className="w-4 h-4 text-blue-600" />
          <span>Filters</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          
          {/* Subject Filter */}
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Subject</label>
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="w-full p-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
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
              className="w-full p-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
            >
              <option value="ALL">All Batches</option>
              <option value="All Students">All Students (74)</option>
              <option value="Batch 1">Batch 1 Only (37)</option>
              <option value="Batch 2">Batch 2 Only (37)</option>
            </select>
          </div>

          {/* CR Filter */}
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Recorded By (CR)</label>
            <select
              value={crFilter}
              onChange={(e) => setCrFilter(e.target.value)}
              className="w-full p-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
            >
              <option value="ALL">All CRs</option>
              <option value="Girl CR 1">Girl CR 1</option>
              <option value="Girl CR 2">Girl CR 2</option>
              <option value="Boy CR 1">Boy CR 1</option>
              <option value="Boy CR 2">Boy CR 2</option>
              <option value="Central Member">Central Member</option>
            </select>
          </div>

          {/* Group Filter */}
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">CR Group</label>
            <select
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
              className="w-full p-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
            >
              <option value="ALL">All Groups</option>
              <option value="Girls">Girls Group</option>
              <option value="Boys">Boys Group</option>
              <option value="Central">Central</option>
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

      {/* History Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xs border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
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
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    Loading attendance history...
                  </td>
                </tr>
              ) : sessions.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    No attendance sessions recorded yet matching your filter.
                  </td>
                </tr>
              ) : (
                sessions.map((s) => {
                  const pct = s.totalCount > 0 ? ((s.presentCount / s.totalCount) * 100).toFixed(1) : 100;
                  const canEdit = isCentralMember || s.createdBy === user?.displayName;

                  return (
                    <tr key={s.sessionId} className="hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">{s.date}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{s.startTime} – {s.endTime}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">{s.subject}</div>
                        <div className="font-mono text-[11px] text-slate-500 dark:text-slate-400">{s.courseCode}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-slate-800 dark:text-slate-200 text-xs truncate max-w-[150px]">{s.faculty}</div>
                        <div className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">Room: {s.room}</div>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          s.batch === 'Batch 1'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300'
                            : s.batch === 'Batch 2'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300'
                            : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
                        }`}>
                          {s.batch}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">{s.createdBy}</div>
                        <div className="text-[11px] text-slate-400">{s.crGroup} Group</div>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">{s.presentCount}</span> / <span className="font-bold text-slate-700 dark:text-slate-300">{s.totalCount}</span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className="font-bold text-blue-600 dark:text-blue-400">{pct}%</span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          
                          {/* View & Edit */}
                          <button
                            onClick={() => handleOpenEdit(s.sessionId)}
                            title="View / Edit Session"
                            className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* WhatsApp Share */}
                          <button
                            onClick={() => handleShareSession(s)}
                            title="Share on WhatsApp (Original Date/Time)"
                            className="p-1.5 rounded-lg text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>

                          {/* Delete Session */}
                          <button
                            onClick={() => setDeleteSessionId(s.sessionId)}
                            title="Delete Session"
                            className="p-1.5 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
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
            
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Attendance Session: {editSessionData.session.subject} ({editSessionData.session.batch})
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Date: {editSessionData.session.date} • Time: {editSessionData.session.startTime} – {editSessionData.session.endTime} • Created by: {editSessionData.session.createdBy}
                </p>
              </div>
              <button
                onClick={() => setEditSessionData(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Click status button to change student status:
                </span>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Present: <span className="text-emerald-600">{editSessionData.records.filter(r => r.status === 'PRESENT').length}</span> / {editSessionData.records.length}
                </div>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden max-h-[50vh] overflow-y-auto">
                {editSessionData.records.map((student) => {
                  const isPresent = student.status === 'PRESENT';
                  return (
                    <div
                      key={student.rollNumber}
                      className="p-3 flex items-center justify-between gap-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    >
                      <div>
                        <div className="font-mono font-bold text-slate-900 dark:text-white">
                          {student.rollNumber}
                        </div>
                        <div className="text-slate-600 dark:text-slate-300 font-medium">
                          {student.name}
                        </div>
                      </div>

                      <button
                        onClick={() => handleToggleEditStatus(student.rollNumber)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          isPresent
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'bg-red-600 hover:bg-red-700 text-white'
                        }`}
                      >
                        {isPresent ? '✓ PRESENT' : '✗ ABSENT'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
              <button
                onClick={() => handleShareSession(editSessionData.session)}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5"
              >
                <Share2 className="w-4 h-4" />
                Share WhatsApp
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditSessionData(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEditedAttendance}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5"
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
        message="Are you sure you want to permanently delete this attendance session? This action cannot be undone and will be logged in the ERP audit trail."
        confirmText={isDeleting ? 'Deleting...' : 'Delete Session'}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteSessionId(null)}
      />

    </div>
  );
}
