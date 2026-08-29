import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Search, Filter, Calendar, Clock, User } from 'lucide-react';

export default function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('ALL');
  const [userFilter, setUserFilter] = useState('ALL');

  useEffect(() => {
    const token = sessionStorage.getItem('vnr_token');
    let url = '/api/audit?';
    if (actionFilter !== 'ALL') url += `&action=${actionFilter}`;
    if (userFilter !== 'ALL') url += `&user=${userFilter}`;

    fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => setLogs(d.logs || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [actionFilter, userFilter]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xs border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200 text-xs font-bold uppercase">
              SECURITY & AUDIT
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              ERP Audit Trail & Action History
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            System Audit Log
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Immutable tracking of attendance creation, edits, deletions, and user logins.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="w-full sm:w-48">
          <label className="block text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Action</label>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="w-full p-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
          >
            <option value="ALL">All Actions</option>
            <option value="CREATE_ATTENDANCE">CREATE_ATTENDANCE</option>
            <option value="EDIT_ATTENDANCE">EDIT_ATTENDANCE</option>
            <option value="DELETE_ATTENDANCE">DELETE_ATTENDANCE</option>
            <option value="LOGIN">LOGIN</option>
            <option value="PASSWORD_CHANGE">PASSWORD_CHANGE</option>
          </select>
        </div>

        <div className="w-full sm:w-48">
          <label className="block text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">User</label>
          <select
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            className="w-full p-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
          >
            <option value="ALL">All Users</option>
            <option value="Girl CR 1">Girl CR 1</option>
            <option value="Girl CR 2">Girl CR 2</option>
            <option value="Boy CR 1">Boy CR 1</option>
            <option value="Boy CR 2">Boy CR 2</option>
            <option value="Central Member">Central Member</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xs border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                <th className="py-3 px-4 w-44">Date & Time</th>
                <th className="py-3 px-4 w-40">User & Role</th>
                <th className="py-3 px-4 w-44">Action</th>
                <th className="py-3 px-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {loading ? (
                <tr>
                  <td colSpan="4" className="py-12 text-center text-slate-400">
                    Loading audit trail...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-12 text-center text-slate-400">
                    No audit logs match current filters.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-850">
                    <td className="py-3 px-4 font-mono text-slate-500 dark:text-slate-400">
                      <div>{log.date}</div>
                      <div className="text-[11px]">{log.time}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{log.user_name}</div>
                      <div className="text-[11px] text-slate-400 capitalize">{log.role.replace('_', ' ')}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                        log.action === 'CREATE_ATTENDANCE'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : log.action === 'EDIT_ATTENDANCE'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : log.action === 'DELETE_ATTENDANCE'
                          ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">
                      {log.details || `${log.subject || ''} ${log.session_id ? '(' + log.session_id + ')' : ''}`}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
