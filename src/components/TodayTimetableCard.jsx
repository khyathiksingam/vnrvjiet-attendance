import React from 'react';
import { Clock, MapPin, User, Users, BookOpen, CheckCircle2, AlertCircle } from 'lucide-react';

export default function TodayTimetableCard({ timetableData, onSelectSubject }) {
  if (!timetableData) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 animate-pulse">
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-md w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-16 bg-slate-100 dark:bg-slate-800 rounded-lg"></div>
          <div className="h-16 bg-slate-100 dark:bg-slate-800 rounded-lg"></div>
        </div>
      </div>
    );
  }

  const { day, todaySchedule = [], currentPeriod } = timetableData;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xs border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
        <div className="flex items-center gap-2.5">
          <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            Today's Timetable ({day})
          </h2>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
          {todaySchedule.filter(p => p.isAttendanceRequired).length} Attendance Sessions
        </span>
      </div>

      <div className="p-4 sm:p-5 space-y-3">
        {todaySchedule.length === 0 ? (
          <div className="py-8 text-center text-slate-500 dark:text-slate-400">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No classes scheduled for today ({day}). Enjoy your day off!</p>
          </div>
        ) : (
          todaySchedule.map((period, idx) => {
            const isCurrent = currentPeriod && currentPeriod.id === period.id;
            const isLunch = period.subject === 'LUNCH';
            const isFree = period.isFreePeriod;

            return (
              <div
                key={period.id || idx}
                className={`p-3.5 sm:p-4 rounded-xl border transition-all relative ${
                  isCurrent
                    ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 ring-2 ring-blue-500/20 dark:ring-blue-400/20'
                    : isLunch
                    ? 'border-amber-200 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20'
                    : isFree
                    ? 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 opacity-75'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {isCurrent && (
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[11px] font-bold shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                    RUNNING NOW
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                        {period.startTime} – {period.endTime}
                      </span>
                      {period.isContinuous && (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300">
                          Continuous Block (1 Session)
                        </span>
                      )}
                      {period.hasBatchSplit && (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300">
                          Batch Split (/)
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      {period.subject}
                      {period.courseCode && period.courseCode !== '-' && (
                        <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                          ({period.courseCode})
                        </span>
                      )}
                    </h3>

                    {!isFree && (
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-400 pt-0.5">
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          {period.faculty}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          Room: <strong className="font-semibold text-slate-800 dark:text-slate-200">{period.room}</strong>
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          {period.hasBatchSplit ? 'Batch 1 / Batch 2 (37 each)' : 'All Students (74)'}
                        </span>
                      </div>
                    )}
                  </div>

                  {period.isAttendanceRequired && onSelectSubject && (
                    <div className="pt-2 sm:pt-0">
                      <button
                        onClick={() => onSelectSubject(period)}
                        className="w-full sm:w-auto px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Take Attendance
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
