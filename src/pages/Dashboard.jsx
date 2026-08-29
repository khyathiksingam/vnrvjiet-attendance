import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import CurrentClassHero from '../components/CurrentClassHero';
import TodayTimetableCard from '../components/TodayTimetableCard';
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Shield, 
  TrendingUp, 
  CheckSquare, 
  History, 
  UserCheck,
  BarChart2
} from 'lucide-react';

import { TIMETABLE } from '../data/masterData';

// Helper to convert '10:00 AM' to minutes from midnight
function timeStrToMinutes(timeStr) {
  if (!timeStr) return -1;
  const parts = timeStr.trim().split(' ');
  if (parts.length < 2) return -1;
  const [hoursStr, minutesStr] = parts[0].split(':');
  let hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10) || 0;
  const period = parts[1].toUpperCase();
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

function findLiveCurrentPeriod(scheduleList) {
  if (!Array.isArray(scheduleList) || scheduleList.length === 0) return null;
  const now = new Date();
  const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();

  for (const period of scheduleList) {
    const startM = period.startMinutes || timeStrToMinutes(period.startTime);
    const endM = period.endMinutes || timeStrToMinutes(period.endTime);
    if (startM !== -1 && endM !== -1) {
      if (currentTotalMinutes >= startM && currentTotalMinutes < endM) {
        return period;
      }
    }
  }
  return null;
}

export default function Dashboard({ setTab, onSelectSubjectForAttendance }) {
  const { user } = useAuth();
  
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayName = days[new Date().getDay()];
  const todaySchedule = TIMETABLE[todayName] || [];

  const [timetableData, setTimetableData] = useState({
    day: todayName,
    isCollegeDay: todayName !== 'Sunday',
    schedule: todaySchedule,
    currentPeriod: findLiveCurrentPeriod(todaySchedule)
  });
  const [stats, setStats] = useState({
    totalSessions: 0,
    todaySessionsCount: 0,
    todayPresent: 0,
    todayTotal: 0,
    todayPercentage: 100
  });
  const [loading, setLoading] = useState(false);
  const [currentTimeStr, setCurrentTimeStr] = useState('');
  const [currentDateStr, setCurrentDateStr] = useState('');

  // Live clock and periodic current class check
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
      setCurrentDateStr(now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
      
      // Update running class in real time
      setTimetableData(prev => ({
        ...prev,
        currentPeriod: findLiveCurrentPeriod(prev.schedule)
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch timetable and statistics from backend if available
  useEffect(() => {
    Promise.all([
      fetch('/api/timetable/current').then(r => r.ok ? r.json() : null),
      fetch('/api/reports/dashboard-stats').then(r => r.ok ? r.json() : null)
    ])
      .then(([tt, st]) => {
        if (tt && (tt.todaySchedule || tt.schedule)) {
          const list = tt.todaySchedule || tt.schedule || [];
          setTimetableData({
            day: tt.day || todayName,
            isCollegeDay: tt.day !== 'Sunday',
            schedule: list,
            currentPeriod: tt.currentPeriod || findLiveCurrentPeriod(list)
          });
        }
        if (st) setStats(st);
      })
      .catch(err => console.log('Dashboard backend syncing:', err));
  }, []);

  const handleTakeAttendance = (period) => {
    if (onSelectSubjectForAttendance) {
      onSelectSubjectForAttendance(period);
    }
    setTab('attendance');
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      
      {/* Welcome Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-7 shadow-xs border border-slate-200 dark:border-slate-800 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
                CLASS ATTENDANCE DASHBOARD
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Academic Year: 2026–2027 • Regulation R25
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              VNR VJIET Class Attendance
            </h1>
            
            <p className="text-sm font-semibold text-blue-700 dark:text-blue-400">
              CSE-CYS | II Year | I Semester | Section B
            </p>
          </div>

          {/* Live Date & Time Display */}
          <div className="text-left md:text-right bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/60">
            <div className="flex items-center md:justify-end gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              <Calendar className="w-3.5 h-3.5" />
              <span>{currentDateStr}</span>
            </div>
            <div className="flex items-center md:justify-end gap-2 text-xl font-bold font-mono text-slate-900 dark:text-white mt-0.5">
              <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>{currentTimeStr}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Prominent Current Class Hero Card */}
      <CurrentClassHero 
        currentPeriod={timetableData?.currentPeriod} 
        onTakeAttendance={handleTakeAttendance} 
      />

      {/* Statistics Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Total Students */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Students</span>
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            74
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Batch 1 (37) • Batch 2 (37)
          </div>
        </div>

        {/* Total Sessions Recorded */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              Total Sessions
            </span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {stats?.totalSessions || 0}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Permanently saved in ERP
          </div>
        </div>

        {/* Today's Attendance Sessions */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Today's Sessions</span>
            <Clock className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {stats?.todaySessionsCount || 0}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Classes taken today
          </div>
        </div>

        {/* Today's Overall Attendance % */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Today's Rate</span>
            <TrendingUp className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {stats?.todayPercentage !== undefined ? `${stats.todayPercentage}%` : '100%'}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {stats?.todayPresent || 0} Present / {stats?.todayTotal || 0} Total
          </div>
        </div>

      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => setTab('attendance')}
          className="flex items-center gap-4 p-5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md hover:shadow-lg transition-all text-left"
        >
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <div className="text-base font-bold">Take Attendance</div>
            <div className="text-xs text-blue-100 mt-0.5">Record attendance for current/scheduled class</div>
          </div>
        </button>

        <button
          onClick={() => setTab('history')}
          className="flex items-center gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 font-semibold shadow-xs hover:shadow-md transition-all text-left"
        >
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-slate-700 dark:text-slate-300">
            <History className="w-6 h-6" />
          </div>
          <div>
            <div className="text-base font-bold text-slate-900 dark:text-white">
              Attendance History
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Review saved records & WhatsApp shares
            </div>
          </div>
        </button>

        <button
          onClick={() => setTab('students')}
          className="flex items-center gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 font-semibold shadow-xs hover:shadow-md transition-all text-left"
        >
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-slate-700 dark:text-slate-300">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-base font-bold text-slate-900 dark:text-white">View 74 Students</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Check Batch 1 & 2 individual histories
            </div>
          </div>
        </button>
      </div>

      {/* Today's Timetable Section */}
      <TodayTimetableCard 
        timetableData={timetableData} 
        onSelectSubject={handleTakeAttendance} 
      />

    </div>
  );
}
