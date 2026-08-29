import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Shield, GraduationCap, LogOut, User, ChevronDown } from 'lucide-react';
import AdminPermissionsModal from '../AdminPermissionsModal';

export default function Header() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & University Branding */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-600 dark:bg-blue-500 flex items-center justify-center text-white shadow-md">
              <GraduationCap className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base sm:text-lg tracking-tight text-slate-900 dark:text-white">
                  VNR VJIET
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-semibold rounded-md bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200">
                  R25 • 2026–2027
                </span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">
                CSE-CYS | II Year | I Semester | Section B
              </p>
            </div>
          </div>

          {/* Right Controls: Exactly matching Image 1 */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* 1. Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="p-2 sm:p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors focus:outline-hidden shadow-2xs"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
            </button>

            {/* 2. Role: ADMIN Badge (Pink/Red Pill) */}
            <button
              onClick={() => setIsAdminModalOpen(true)}
              className="px-4 py-2 rounded-full border border-rose-200 dark:border-rose-900/60 bg-rose-50/90 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/40 text-rose-900 dark:text-rose-200 text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2 shadow-2xs"
              title="Admin Permissions & Access Control"
            >
              <Shield className="w-4 h-4 text-rose-700 dark:text-rose-400" />
              <span>Role: ADMIN</span>
            </button>

            {/* 3. Profile Avatar Dropdown (Potta Devika - CSE) */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-3 py-1.5 flex items-center gap-2.5 shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors focus:outline-hidden"
              >
                {/* Avatar Icon */}
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-sm shadow-xs shrink-0">
                  {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'C'}
                </div>
                {/* Name & Dept */}
                <div className="text-left hidden sm:block">
                  <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                    {user?.displayName || 'C.Rithvik'}
                  </div>
                  <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 leading-tight">
                    {user?.dept || 'CSE'}
                  </div>
                </div>
                {/* Chevron */}
                <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
              </button>

              {/* Profile Dropdown Menu */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-in fade-in">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      {user?.displayName || 'C.Rithvik'}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Central Admin • {user?.dept || 'CSE'}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      setIsAdminModalOpen(true);
                    }}
                    className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors"
                  >
                    <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>Admin Permissions</span>
                  </button>

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      logout();
                    }}
                    className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 flex items-center gap-2 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log out</span>
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* Admin Permissions Modal */}
      <AdminPermissionsModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
      />
    </header>
  );
}
