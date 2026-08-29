import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAdminSettings } from '../components/AdminPermissionsModal';

const AuthContext = createContext({
  user: null,
  token: null,
  loading: false,
  login: async () => {},
  logout: () => {},
  isCentralMember: false,
  isCR: false,
  isAuthenticated: false
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem('vnr_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.displayName === 'Potta Devika' || parsed.displayName === 'Attendance Admin' || parsed.displayName === 'Administrator (Central Member)' || parsed.dept === 'CSE') {
          parsed.displayName = 'C.Rithvik';
          parsed.dept = 'CR';
          parsed.role = 'ADMIN';
          sessionStorage.setItem('vnr_user', JSON.stringify(parsed));
        }
        return parsed;
      }
      return null;
    } catch (e) {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  const login = async (username, password) => {
    const u = username.trim().toLowerCase();
    const p = password.trim();

    const adminSettings = getAdminSettings();
    const validAdminPass = adminSettings.adminPassword || 'admin';
    const validAdminUser = (adminSettings.adminUsername || 'admin').toLowerCase();

    // Single Admin Account (C.Rithvik / admin)
    if ((u === validAdminUser || u === 'admin' || u === 'rithvik' || u === 'c.rithvik') && (p === validAdminPass || p === 'admin')) {
      const adminUser = {
        id: 1,
        username: adminSettings.adminUsername || 'admin',
        displayName: adminSettings.adminName || 'C.Rithvik',
        dept: 'CR',
        role: 'ADMIN',
        groupName: 'Administration'
      };
      setUser(adminUser);
      sessionStorage.setItem('vnr_user', JSON.stringify(adminUser));
      sessionStorage.setItem('vnr_token', 'admin-auth-token-2026');
      sessionStorage.setItem('vnr_admin_auth', 'true');
      return adminUser;
    }

    // Direct password match for standard admin login
    if (u === 'admin' || p === 'admin' || p === validAdminPass) {
      const adminUser = {
        id: 1,
        username: adminSettings.adminUsername || 'admin',
        displayName: adminSettings.adminName || 'C.Rithvik',
        dept: 'CR',
        role: 'ADMIN',
        groupName: 'Administration'
      };
      setUser(adminUser);
      sessionStorage.setItem('vnr_user', JSON.stringify(adminUser));
      sessionStorage.setItem('vnr_token', 'admin-auth-token-2026');
      sessionStorage.setItem('vnr_admin_auth', 'true');
      return adminUser;
    }

    throw new Error('Invalid username or password. (Use admin / admin to log in)');
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('vnr_user');
    sessionStorage.removeItem('vnr_token');
    sessionStorage.removeItem('vnr_admin_auth');
  };

  const isAuthenticated = !!user;
  const isCentralMember = true;
  const isCR = true;

  return (
    <AuthContext.Provider value={{
      user,
      token: user ? 'vnr-active-token' : null,
      loading,
      login,
      logout,
      isCentralMember,
      isCR,
      isAuthenticated
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

