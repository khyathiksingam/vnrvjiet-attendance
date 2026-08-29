import React, { useState, useEffect } from 'react';
import StudentHistoryModal from './StudentHistoryModal';
import { Users, Search, Filter, UserCheck, Eye, GraduationCap, ArrowLeft } from 'lucide-react';
import { STUDENTS } from '../data/masterData';

export default function Students({ setTab }) {
  const [students, setStudents] = useState(STUDENTS);
  const [loading, setLoading] = useState(false);
  const [batchFilter, setBatchFilter] = useState('ALL'); // 'ALL' | 'Batch 1' | 'Batch 2'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentRoll, setSelectedStudentRoll] = useState(null);

  useEffect(() => {
    fetch('/api/students')
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d && Array.isArray(d.students) && d.students.length > 0) {
          setStudents(d.students);
        }
      })
      .catch(err => console.log('Students synced from local master:', err));
  }, []);

  const filtered = React.useMemo(() => {
    let list = [...students];
    if (batchFilter !== 'ALL') {
      list = list.filter(s => s.batch === batchFilter);
    } else {
      // Non-batch times (ALL): Regulars first, then LEs
      list.sort((a, b) => {
        const isALe = a.rollNumber.startsWith('26075');
        const isBLe = b.rollNumber.startsWith('26075');
        if (isALe !== isBLe) return isALe ? 1 : -1;
        return a.rollNumber.localeCompare(b.rollNumber);
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(s => s.rollNumber.toLowerCase().includes(q) || s.name.toLowerCase().includes(q));
    }

    return list.map((s, idx) => ({ ...s, sNo: idx + 1 }));
  }, [students, batchFilter, searchQuery]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Banner */}
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
              STUDENT DIRECTORY
            </span>
            <span className="hidden sm:inline text-xs text-slate-500 dark:text-slate-400">
              Exact 74 Student Master Roster
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            Students Roster & Attendance History
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            CSE-CYS | II Year | I Semester | Section B • Click on any student to view complete attendance history
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-200 text-center">
            <div className="text-xs font-bold uppercase">Total Students</div>
            <div className="text-xl font-extrabold">74</div>
          </div>
          <div className="px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-center">
            <div className="text-xs font-bold uppercase">Batch 1 / 2</div>
            <div className="text-xl font-extrabold">37 / 37</div>
          </div>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student name or full roll number..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm placeholder-slate-400 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
          />
        </div>

        {/* Batch Filter Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setBatchFilter('ALL')}
            className={`flex-1 sm:flex-none px-3.5 py-2 text-xs font-semibold rounded-xl transition-colors ${
              batchFilter === 'ALL'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All (74)
          </button>
          <button
            onClick={() => setBatchFilter('Batch 1')}
            className={`flex-1 sm:flex-none px-3.5 py-2 text-xs font-semibold rounded-xl transition-colors ${
              batchFilter === 'Batch 1'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Batch 1 (37)
          </button>
          <button
            onClick={() => setBatchFilter('Batch 2')}
            className={`flex-1 sm:flex-none px-3.5 py-2 text-xs font-semibold rounded-xl transition-colors ${
              batchFilter === 'Batch 2'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Batch 2 (37)
          </button>
        </div>

      </div>

      {/* Table of Students */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xs border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                <th className="py-3 px-4 w-14 text-center">S.No</th>
                <th className="py-3 px-4 w-40">Full Roll Number</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4 w-32 text-center">Lab Batch</th>
                <th className="py-3 px-4 w-32 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400">
                    Loading student directory...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400">
                    No students found matching the filter.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr
                    key={s.rollNumber}
                    onClick={() => setSelectedStudentRoll(s.rollNumber)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 text-center font-mono text-xs text-slate-400">
                      {s.sNo}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-slate-100">
                      {s.rollNumber}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">
                      {s.name}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                        s.batch === 'Batch 1'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300'
                          : 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300'
                      }`}>
                        {s.batch}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setSelectedStudentRoll(s.rollNumber)}
                        className="px-3 py-1 text-xs font-semibold rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 transition-colors inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        History
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student History Modal */}
      {selectedStudentRoll && (
        <StudentHistoryModal
          rollNumber={selectedStudentRoll}
          onClose={() => setSelectedStudentRoll(null)}
        />
      )}

    </div>
  );
}
