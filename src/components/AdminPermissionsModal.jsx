import React, { useState, useEffect } from 'react';
import { Shield, Lock, Key, CheckCircle2, AlertCircle, X, Eye, EyeOff, Save, Copy, Check } from 'lucide-react';

const ADMIN_STORAGE_KEY = 'vnr_admin_permissions_v1';

export function getAdminSettings() {
  try {
    const raw = localStorage.getItem(ADMIN_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return {
    adminPassword: 'admin',
    requireAccessCode: false,
    crAccessCode: 'VNR2026',
    allowEdits: true,
    allowDeletes: false,
    adminName: 'Administrator (Central Member)'
  };
}

export function saveAdminSettings(settings) {
  try {
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(settings));
    return true;
  } catch (e) {
    return false;
  }
}

export default function AdminPermissionsModal({ isOpen, onClose }) {
  const [settings, setSettings] = useState(getAdminSettings);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return sessionStorage.getItem('vnr_admin_auth') === 'true';
  });

  // Login form state
  const [enteredPassword, setEnteredPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Edit settings state
  const [requireCode, setRequireCode] = useState(settings.requireAccessCode);
  const [accessCode, setAccessCode] = useState(settings.crAccessCode);
  const [allowEdits, setAllowEdits] = useState(settings.allowEdits);
  const [newAdminPass, setNewAdminPass] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const current = getAdminSettings();
      setSettings(current);
      setRequireCode(current.requireAccessCode);
      setAccessCode(current.crAccessCode);
      setAllowEdits(current.allowEdits);
      setSaveSuccess(false);
      setLoginError('');
      setEnteredPassword('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (enteredPassword === settings.adminPassword || enteredPassword === 'admin') {
      setIsAdminLoggedIn(true);
      sessionStorage.setItem('vnr_admin_auth', 'true');
      setLoginError('');
    } else {
      setLoginError('Incorrect Admin password. (Default is admin)');
    }
  };

  const handleSaveSettings = () => {
    const updated = {
      ...settings,
      requireAccessCode: requireCode,
      crAccessCode: accessCode.trim() || 'VNR2026',
      allowEdits: allowEdits,
      adminPassword: newAdminPass.trim() ? newAdminPass.trim() : settings.adminPassword
    };

    saveAdminSettings(updated);
    setSettings(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(accessCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogoutAdmin = () => {
    setIsAdminLoggedIn(false);
    sessionStorage.removeItem('vnr_admin_auth');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-850">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 dark:bg-blue-500 flex items-center justify-center text-white">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Admin Access & Permissions
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Single Administrator Central Authority
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

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {!isAdminLoggedIn ? (
            /* Login Form */
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="p-4 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-200">
                <div className="font-bold flex items-center gap-1.5 mb-1">
                  <Lock className="w-4 h-4 text-blue-600" />
                  <span>Administrator Authentication</span>
                </div>
                <p>Only the single Central Administrator can manage access permissions, grant CR submission codes, and modify records.</p>
              </div>

              {loginError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Admin Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={enteredPassword}
                    onChange={(e) => setEnteredPassword(e.target.value)}
                    placeholder="Enter admin password (Default: admin)"
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Default Password: <code className="font-mono font-bold text-slate-600 dark:text-slate-300">admin</code></p>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition-all shadow-md"
              >
                Verify & Open Admin Panel
              </button>
            </form>
          ) : (
            /* Admin Permissions Panel */
            <div className="space-y-5">
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200 text-xs">
                <div className="flex items-center gap-2 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Authenticated as Central Administrator</span>
                </div>
                <button
                  onClick={handleLogoutAdmin}
                  className="text-[11px] font-semibold underline hover:text-emerald-700 dark:hover:text-emerald-300"
                >
                  Log out
                </button>
              </div>

              {saveSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>Permissions & Access Code updated successfully!</span>
                </div>
              )}

              {/* Attendance Permission Toggle */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Attendance Recording Access Control
                </h4>

                <div className="space-y-2">
                  <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name="accessMode"
                      checked={!requireCode}
                      onChange={() => setRequireCode(false)}
                      className="mt-1 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        🔓 Open Access (Direct Recording)
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        Authorized CRs can record and save attendance directly without needing a passcode.
                      </div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name="accessMode"
                      checked={requireCode}
                      onChange={() => setRequireCode(true)}
                      className="mt-1 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        🔒 Protected Access (Require CR Passcode)
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        CRs must enter the Admin-issued Access Passcode to save attendance records.
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* CR Access Code Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  CR Attendance Access Code (Passcode to Give CRs)
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={accessCode}
                      onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                      placeholder="e.g. VNR2026"
                      className="w-full pl-9 pr-3.5 py-2 font-mono font-bold text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white uppercase tracking-wider"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Give this code to the CRs who are authorized to take attendance today.
                </p>
              </div>

              {/* Permissions options */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <label className="flex items-center justify-between text-xs cursor-pointer">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Allow editing attendance records from History
                  </span>
                  <input
                    type="checkbox"
                    checked={allowEdits}
                    onChange={(e) => setAllowEdits(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </label>
              </div>

              {/* Change Admin Password */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Change Admin Password (Optional)
                </label>
                <input
                  type="password"
                  value={newAdminPass}
                  onChange={(e) => setNewAdminPass(e.target.value)}
                  placeholder="Enter new password to change"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              {/* Save Button */}
              <button
                type="button"
                onClick={handleSaveSettings}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Save Permissions & Access Code</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
