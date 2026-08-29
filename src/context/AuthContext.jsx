import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({
    id: 1,
    username: 'admin',
    displayName: 'Attendance Admin',
    role: 'admin',
    groupName: 'General'
  });

  return (
    <AuthContext.Provider value={{
      user,
      token: 'session-token',
      loading: false,
      login: async () => {},
      logout: () => {},
      isCentralMember: true,
      isCR: true,
      isAuthenticated: true
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

