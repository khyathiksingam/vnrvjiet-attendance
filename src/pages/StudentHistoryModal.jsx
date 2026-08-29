import React, { useState, useEffect } from 'react';
import { X, User, CheckCircle2, XCircle, Calendar, Clock, MapPin, Shield } from 'lucide-react';

export default function StudentHistoryModal({ rollNumber, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!rollNumber) return;
    const token = sessionStorage.getItem('vnr_token');
    
    fetch(`/api/students/${rollNumber}/history`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(json => setData(json))
      .catch(err => console.error('Error fetching student history:', err))
      .finally(() => setLoading(false));
  }, [rollNumber]);

  if (!rollNumber) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-700 dark:text-blue-300">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {data?.student?.name || 'Loading Student...'}
              </h3>
              <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                Roll No: <span className="font-semibold text-slate-800 dark:text-slate-200">{rollNumber}</span> • {data?.student?.batch}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {loading ? (
            <div className="py-12 text-center text-slate-400">Loading student attendance records...</div>
          ) : (
            <>
              {/* Overall Statistics Strip */}
              <div className="grid grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-center">
                  <div className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400">Applicable</div>
                  <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                    {data?.stats?.totalApplicable || 0}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-center border border-emerald-200 dark:border-emerald-900/50">
                  <div className="text-[11px] font-bold uppercase text-emerald-700 dark:text-emerald-300">Present</div>
                  <div className="text-xl font-extrabold text-emerald-800 dark:text-emerald-200 mt-0.5">
                    {data?.stats?.presentCount || 0}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 text-center border border-red-200 dark:border-red-900/50">
                  <div className="text-[11px] font-bold uppercase text-red-700 dark:text-red-300">Absent</div>
                  <div className="text-xl font-extrabold text-red-800 dark:text-red-200 mt-0.5">
                    {data?.stats?.absentCount || 0}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-center border border-blue-200 dark:border-blue-900/50">
                  <div className="text-[11px] font-bold uppercase text-blue-700 dark:text-blue-300">Percentage</div>
                  <div className="text-xl font-extrabold text-blue-800 dark:text-blue-200 mt-0.5">
                    {data?.stats?.attendancePercentage}%
                  </div>
                </div>
              </div>

              {/* Attendance Session Timeline */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
                  Attendance Records History (Combined Across All CRs)
                </h4>

                {data?.records?.length === 0 ? (
                  <div className="py-8 text-center text-sm text-slate-400">
                    No attendance sessions recorded yet for this student.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                    {data?.records?.map((rec, idx) => {
                      const isPresent = rec.status === 'PRESENT';
                      return (
                        <div key={idx} className="p-3.5 flex items-center justify-between gap-3 text-xs">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 dark:text-white text-sm">
                                {rec.subject}
                              </span>
                              <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                                ({rec.courseCode})
                              </span>
                              <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                                {rec.sessionBatch}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {rec.date}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {rec.startTime} – {rec.endTime}
                              </span>
                              <span className="flex items-center gap-1">
                                <Shield className="w-3 h-3 text-purple-500" />
                                CR: <strong className="text-slate-700 dark:text-slate-300">{rec.createdBy}</strong>
                              </span>
                            </div>
                          </div>

                          <div className="shrink-0">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                              isPresent
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                            }`}>
                              {isPresent ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                              {rec.status}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
