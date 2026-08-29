import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500 dark:text-slate-400 transition-colors mt-auto">
      <div className="max-w-7xl mx-auto px-4">
        <p className="font-semibold text-slate-700 dark:text-slate-300">
          VNR VIGNANA JYOTHI INSTITUTE OF ENGINEERING & TECHNOLOGY
        </p>
        <p className="mt-1">
          B.Tech | CSE-CYS | II Year | III Semester | Section B • Academic Year 2026–2027 • Regulation R25
        </p>
        <p className="mt-2 text-slate-400 dark:text-slate-500 text-[11px]">
          Class Attendance & Management ERP System
        </p>
      </div>
    </footer>
  );
}
