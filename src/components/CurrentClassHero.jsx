import React from 'react';
import { PlayCircle, Clock, MapPin, User, Users, AlertCircle, ArrowRight } from 'lucide-react';

export default function CurrentClassHero({ currentPeriod, onTakeAttendance }) {
  if (!currentPeriod || !currentPeriod.isAttendanceRequired) {
    return (
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl p-6 sm:p-7 shadow-xs border border-slate-200 dark:border-slate-800 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  CLASS STATUS
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Timetable Hours: 10:00 AM – 4:40 PM
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                No class currently in session
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Classes for today have concluded or haven't started yet.
              </p>
            </div>
          </div>

          <button
            onClick={() => onTakeAttendance({ subject: 'PSA', startTime: '10:00 AM', endTime: '11:00 AM' })}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 self-start sm:self-auto"
          >
            <span>Record Attendance</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white rounded-2xl p-6 sm:p-7 shadow-xl border border-blue-700/50 relative overflow-hidden">
      {/* Background glow circle */}
      <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-blue-500/20 rounded-full blur-2xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              Class In Session
            </span>
            <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-blue-950/60 border border-blue-700/40 text-blue-200">
              {currentPeriod.startTime} – {currentPeriod.endTime}
            </span>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              {currentPeriod.subject}
            </h2>
            {currentPeriod.courseCode && (
              <p className="text-sm font-medium text-blue-200 mt-0.5">
                Course Code: <span className="font-mono font-semibold">{currentPeriod.courseCode}</span>
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-blue-100 pt-1">
            <div className="flex items-center gap-1.5 bg-blue-950/40 px-3 py-1.5 rounded-lg border border-blue-800/40">
              <User className="w-4 h-4 text-blue-300 shrink-0" />
              <span className="truncate">{currentPeriod.faculty}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-blue-950/40 px-3 py-1.5 rounded-lg border border-blue-800/40">
              <MapPin className="w-4 h-4 text-blue-300 shrink-0" />
              <span>Room: <strong className="font-semibold text-white">{currentPeriod.room}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 bg-blue-950/40 px-3 py-1.5 rounded-lg border border-blue-800/40">
              <Users className="w-4 h-4 text-blue-300 shrink-0" />
              <span>{currentPeriod.hasBatchSplit ? 'Batch Class (37)' : 'All Students (74)'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center">
          <button
            onClick={() => onTakeAttendance(currentPeriod)}
            className="w-full md:w-auto px-6 py-3.5 bg-white hover:bg-blue-50 text-blue-900 hover:text-blue-950 font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 text-sm sm:text-base group"
          >
            <span>TAKE ATTENDANCE</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </div>
  );
}
