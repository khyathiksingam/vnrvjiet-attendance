import React, { useState, useEffect } from 'react';
import { TIMETABLE } from '../../server/data/masterData.js';
import { Calendar, Clock, MapPin, User, Users, Info } from 'lucide-react';

export default function TimetablePage() {
  const [activeDay, setActiveDay] = useState(() => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = days[new Date().getDay()];
    return TIMETABLE[today] ? today : 'Monday';
  });

  const daysList = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const schedule = TIMETABLE[activeDay] || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xs border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 text-xs font-bold uppercase">
              SEMESTER I TIMETABLE
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Regulation R25 • Academic Year 2026–2027
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            Weekly Class & Lab Schedule
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            CSE-CYS | II Year | I Semester | Section B • Mon–Sat Schedule with Continuous Blocks
          </p>
        </div>
      </div>

      {/* Rules Explanatory Card */}
      <div className="bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 rounded-2xl p-4 sm:p-5 text-xs text-blue-950 dark:text-blue-200 space-y-2">
        <div className="flex items-center gap-2 font-bold text-sm text-blue-900 dark:text-blue-100">
          <Info className="w-4 h-4 text-blue-600" />
          <span>Important Academic Timetable Rules</span>
        </div>
        <ul className="list-disc list-inside space-y-1 pl-1">
          <li><strong>Lab Batch Separation (/):</strong> The "/" in a subject name (e.g. <em>OS LAB / OOPJ LAB</em>) separates Batch 1 (before "/") and Batch 2 (after "/"). Each batch has 37 students.</li>
          <li><strong>Regular Classes:</strong> Classes without "/" always include <strong>All 74 Students</strong>.</li>
          <li><strong>Continuous Blocks (1 Session):</strong> Multi-hour lab blocks (e.g. Monday CM LAB 11:00 AM–1:00 PM, Wednesday DT 1:40 PM–4:40 PM) are recorded as <strong>ONE attendance session</strong>, not separate hourly sessions.</li>
          <li><strong>Free / Activity Periods:</strong> Lunch, ECA/CCA, MTP, CVA-L2, and Library do not require attendance.</li>
        </ul>
      </div>

      {/* Day Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {daysList.map(day => (
          <button
            key={day}
            onClick={() => setActiveDay(day)}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              activeDay === day
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Schedule Grid for selected day */}
      <div className="space-y-3">
        {schedule.map((period, idx) => {
          const isLunch = period.subject === 'LUNCH';
          const isFree = period.isFreePeriod;

          return (
            <div
              key={period.id || idx}
              className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                isLunch
                  ? 'border-amber-200 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20'
                  : isFree
                  ? 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 opacity-80'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                      {period.startTime} – {period.endTime}
                    </span>
                    {period.isContinuous && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300">
                        Continuous Session (1 Attendance Record)
                      </span>
                    )}
                    {period.hasBatchSplit && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300">
                        Batch Split (37 per Batch)
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    {period.subject}
                    {period.courseCode && period.courseCode !== '-' && (
                      <span className="text-xs font-mono font-normal text-slate-500 dark:text-slate-400">
                        ({period.courseCode})
                      </span>
                    )}
                  </h3>

                  {!isFree && (
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-slate-600 dark:text-slate-400 pt-1">
                      <span className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        Faculty: <strong className="text-slate-800 dark:text-slate-200">{period.faculty}</strong>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        Room: <strong className="text-blue-600 dark:text-blue-400">{period.room}</strong>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        Students: <strong>{period.hasBatchSplit ? 'Batch 1 (37) & Batch 2 (37)' : 'All Students (74)'}</strong>
                      </span>
                    </div>
                  )}
                </div>

                <div className="shrink-0">
                  {period.isAttendanceRequired ? (
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      Attendance Required
                    </span>
                  ) : (
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                      {period.subject === 'LUNCH' ? 'Lunch Break' : 'Free / Activity'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
