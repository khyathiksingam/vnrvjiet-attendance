import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import * as XLSX from 'xlsx';
import { 
  BarChart3, 
  Download, 
  Printer, 
  FileSpreadsheet, 
  Users, 
  BookOpen, 
  AlertTriangle,
  TrendingUp,
  Award
} from 'lucide-react';

export default function Reports() {
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState('subject'); // 'subject' | 'student' | 'cr'
  const [subjectData, setSubjectData] = useState([]);
  const [studentData, setStudentData] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/reports/subject-summary').then(r => r.ok ? r.json() : null),
      fetch('/api/reports/student-summary').then(r => r.ok ? r.json() : null),
      fetch('/api/reports/dashboard-stats').then(r => r.ok ? r.json() : null)
    ])
      .then(([sub, stu, st]) => {
        if (sub && sub.summary) setSubjectData(sub.summary);
        if (stu && stu.summary) setStudentData(stu.summary);
        if (st) setStats(st);
      })
      .catch(err => console.log('Reports sync:', err))
      .finally(() => setLoading(false));
  }, []);

  // Export to Excel / CSV
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    // Subject Summary Sheet
    const subWs = XLSX.utils.json_to_sheet(
      subjectData.map(s => ({
        'Subject': s.subject,
        'Course Code': s.courseCode,
        'Total Classes Held': s.totalClasses,
        'Total Present': s.totalPresent,
        'Total Possible': s.totalPossible,
        'Attendance Percentage': `${s.attendancePercentage}%`
      }))
    );
    XLSX.utils.book_append_sheet(wb, subWs, 'Subject Summary');

    // Student Summary Sheet
    const stuWs = XLSX.utils.json_to_sheet(
      studentData.map(s => ({
        'S.No': s.sNo,
        'Roll Number': s.rollNumber,
        'Student Name': s.name,
        'Batch': s.batch,
        'Total Classes': s.totalClasses,
        'Present': s.present,
        'Absent': s.absent,
        'Attendance %': `${s.attendancePercentage}%`,
        'Low Attendance Warning (<75%)': s.isLowAttendance ? 'YES' : 'NO'
      }))
    );
    XLSX.utils.book_append_sheet(wb, stuWs, 'Student Summary');

    // CR Sessions Sheet
    if (stats?.crCounts) {
      const crWs = XLSX.utils.json_to_sheet([
        { 'Class Representative': 'Girl CR 1 (Girls)', 'Recorded Sessions': stats.crCounts['Girl CR 1'] || 0 },
        { 'Class Representative': 'Girl CR 2 (Girls)', 'Recorded Sessions': stats.crCounts['Girl CR 2'] || 0 },
        { 'Class Representative': 'Boy CR 1 (Boys)', 'Recorded Sessions': stats.crCounts['Boy CR 1'] || 0 },
        { 'Class Representative': 'Boy CR 2 (Boys)', 'Recorded Sessions': stats.crCounts['Boy CR 2'] || 0 },
        { 'Class Representative': 'Central Member', 'Recorded Sessions': stats.crCounts['Central Member'] || 0 },
      ]);
      XLSX.utils.book_append_sheet(wb, crWs, 'CR Session Audit');
    }

    XLSX.writeFile(wb, `VNR_VJIET_Attendance_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xs border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 text-xs font-bold uppercase">
              REPORTS & ANALYTICS
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              CSE-CYS | II Year | I Semester | Section B
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            Attendance Reports & Analytics
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Export official spreadsheets, analyze subject performance, and monitor low attendance.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            Print Report
          </button>

          <button
            onClick={handleExportExcel}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            Export to Excel (.xlsx)
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('subject')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'subject'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Subject-wise Attendance
        </button>
        <button
          onClick={() => setActiveTab('student')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'student'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Student-wise Summary
        </button>
        <button
          onClick={() => setActiveTab('cr')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'cr'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          CR Sessions Summary
        </button>
      </div>

      {/* Subject-Wise Report Tab */}
      {activeTab === 'subject' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xs border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Course Code</th>
                  <th className="py-3 px-4 text-center">Classes Held</th>
                  <th className="py-3 px-4 text-center">Total Present</th>
                  <th className="py-3 px-4 text-center">Total Students</th>
                  <th className="py-3 px-4 text-center">Average Attendance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm">
                {subjectData.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-slate-400">
                      No subject attendance sessions recorded yet.
                    </td>
                  </tr>
                ) : (
                  subjectData.map((sub) => (
                    <tr key={sub.subject} className="hover:bg-slate-50 dark:hover:bg-slate-850">
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                        {sub.subject}
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-slate-500 dark:text-slate-400">
                        {sub.courseCode}
                      </td>
                      <td className="py-3 px-4 text-center font-semibold text-slate-800 dark:text-slate-200">
                        {sub.totalClasses}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-emerald-600 dark:text-emerald-400">
                        {sub.totalPresent}
                      </td>
                      <td className="py-3 px-4 text-center font-semibold text-slate-700 dark:text-slate-300">
                        {sub.totalPossible}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-extrabold text-blue-600 dark:text-blue-400 text-sm">
                          {sub.attendancePercentage}%
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Student-Wise Summary Tab */}
      {activeTab === 'student' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xs border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  <th className="py-3 px-4 w-14 text-center">S.No</th>
                  <th className="py-3 px-4 w-36">Roll Number</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4 text-center">Batch</th>
                  <th className="py-3 px-4 text-center">Classes</th>
                  <th className="py-3 px-4 text-center">Present</th>
                  <th className="py-3 px-4 text-center">Absent</th>
                  <th className="py-3 px-4 text-center">Percentage</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm">
                {studentData.map((stu) => (
                  <tr
                    key={stu.rollNumber}
                    className={`${stu.isLowAttendance ? 'bg-red-50/40 dark:bg-red-950/20' : 'hover:bg-slate-50 dark:hover:bg-slate-850'}`}
                  >
                    <td className="py-3 px-4 text-center font-mono text-slate-400">{stu.sNo}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-slate-100">{stu.rollNumber}</td>
                    <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">{stu.name}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {stu.batch}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-semibold">{stu.totalClasses}</td>
                    <td className="py-3 px-4 text-center font-bold text-emerald-600">{stu.present}</td>
                    <td className="py-3 px-4 text-center font-bold text-red-600">{stu.absent}</td>
                    <td className="py-3 px-4 text-center font-extrabold text-sm text-blue-600 dark:text-blue-400">
                      {stu.attendancePercentage}%
                    </td>
                    <td className="py-3 px-4 text-center">
                      {stu.isLowAttendance ? (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 flex items-center justify-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          &lt;75% Low
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          Eligible
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CR Sessions Tab */}
      {activeTab === 'cr' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span>CR Submission Counts</span>
            </h3>
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-pink-50 dark:bg-pink-950/30 border border-pink-200 dark:border-pink-900 flex items-center justify-between">
                <div>
                  <div className="font-bold text-pink-900 dark:text-pink-200">Girl CR 1</div>
                  <div className="text-xs text-pink-700/70 dark:text-pink-400">Girls Group • Class Representative</div>
                </div>
                <div className="text-2xl font-extrabold text-pink-900 dark:text-pink-100">
                  {stats?.crCounts?.['Girl CR 1'] || 0}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-pink-50 dark:bg-pink-950/30 border border-pink-200 dark:border-pink-900 flex items-center justify-between">
                <div>
                  <div className="font-bold text-pink-900 dark:text-pink-200">Girl CR 2</div>
                  <div className="text-xs text-pink-700/70 dark:text-pink-400">Girls Group • Class Representative</div>
                </div>
                <div className="text-2xl font-extrabold text-pink-900 dark:text-pink-100">
                  {stats?.crCounts?.['Girl CR 2'] || 0}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 flex items-center justify-between">
                <div>
                  <div className="font-bold text-blue-900 dark:text-blue-200">Boy CR 1</div>
                  <div className="text-xs text-blue-700/70 dark:text-blue-400">Boys Group • Class Representative</div>
                </div>
                <div className="text-2xl font-extrabold text-blue-900 dark:text-blue-100">
                  {stats?.crCounts?.['Boy CR 1'] || 0}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 flex items-center justify-between">
                <div>
                  <div className="font-bold text-blue-900 dark:text-blue-200">Boy CR 2</div>
                  <div className="text-xs text-blue-700/70 dark:text-blue-400">Boys Group • Class Representative</div>
                </div>
                <div className="text-2xl font-extrabold text-blue-900 dark:text-blue-100">
                  {stats?.crCounts?.['Boy CR 2'] || 0}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-600" />
              <span>Overall ERP Statistics</span>
            </h3>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Total Enrolled Students</span>
                <strong className="text-slate-900 dark:text-white">74 Students</strong>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Batch 1 Students</span>
                <strong className="text-slate-900 dark:text-white">37 Students</strong>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Batch 2 Students</span>
                <strong className="text-slate-900 dark:text-white">37 Students</strong>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Total Sessions Recorded</span>
                <strong className="text-slate-900 dark:text-white">{stats?.totalSessions || 0} Sessions</strong>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Regulation & Semester</span>
                <strong className="text-slate-900 dark:text-white">R25 • Semester I</strong>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
