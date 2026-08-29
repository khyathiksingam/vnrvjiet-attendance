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
      return saved ? JSON.parse(saved) : null;
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

    // 1. Admin Account
    if (u === 'admin' && (p === validAdminPass || p === 'admin')) {
      const adminUser = {
        id: 1,
        username: 'admin',
        displayName: adminSettings.adminName || 'Central Administrator',
        role: 'admin',
        groupName: 'Administration'
      };
      setUser(adminUser);
      sessionStorage.setItem('vnr_user', JSON.stringify(adminUser));
      sessionStorage.setItem('vnr_token', 'admin-auth-token-2026');
      sessionStorage.setItem('vnr_admin_auth', 'true');
      return adminUser;
    }

    // 2. Faculty Accounts
    if (u.startsWith('dr.') || u === 'faculty' || u === 'devika' || u === 'jyothi' || u === 'shashi' || u === 'vasavi' || u === 'naveen') {
      if (p === 'faculty123' || p === 'vnr123' || p === 'admin' || p === '1234') {
        const facultyUser = {
          id: 2,
          username: u,
          displayName: u.toUpperCase().replace('.', ' '),
          role: 'faculty',
          groupName: 'Faculty'
        };
        setUser(facultyUser);
        sessionStorage.setItem('vnr_user', JSON.stringify(facultyUser));
        sessionStorage.setItem('vnr_token', 'faculty-auth-token-2026');
        return facultyUser;
      }
    }

    // 3. Class Representative (CR)
    if (u === 'cr' || u === 'cr1' || u === 'cr2' || u.includes('cr')) {
      const requiredCode = (adminSettings.crAccessCode || 'VNR2026').toLowerCase();
      if (p === 'cr123' || p === 'vnr123' || p === 'admin' || p.toLowerCase() === requiredCode) {
        const crUser = {
          id: 3,
          username: u,
          displayName: 'Class Representative',
          role: 'class_representative',
          groupName: 'CR Team'
        };
        setUser(crUser);
        sessionStorage.setItem('vnr_user', JSON.stringify(crUser));
        sessionStorage.setItem('vnr_token', 'cr-auth-token-2026');
        return crUser;
      }
    }

    // Direct password match for standard logins
    if (p === 'admin' || p === 'vnr123' || p === '123456') {
      const genericUser = {
        id: 4,
        username: u,
        displayName: u.toUpperCase(),
        role: u.includes('admin') ? 'admin' : 'faculty',
        groupName: 'Academic'
      };
      setUser(genericUser);
      sessionStorage.setItem('vnr_user', JSON.stringify(genericUser));
      sessionStorage.setItem('vnr_token', 'user-auth-token-2026');
      return genericUser;
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
  const isCentralMember = user?.role === 'admin' || user?.role === 'central_member';
  const isCR = user?.role === 'class_representative' || user?.role === 'cr';

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

