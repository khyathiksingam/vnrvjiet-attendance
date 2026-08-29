import React, { createContext, useContext, useState, useEffect } from 'react';

const defaultThemeValue = {
  theme: 'light',
  toggleTheme: () => {},
  isDark: false
};

const ThemeContext = createContext(defaultThemeValue);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('vnr_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return 'light'; // Default to Light Mode
    } catch (e) {
      return 'light';
    }
  });

  useEffect(() => {
    try {
      const root = document.documentElement;
      const body = document.body;
      if (theme === 'dark') {
        root.classList.add('dark');
        body?.classList.add('dark');
        root.setAttribute('data-theme', 'dark');
        root.style.colorScheme = 'dark';
      } else {
        root.classList.remove('dark');
        body?.classList.remove('dark');
        root.setAttribute('data-theme', 'light');
        root.style.colorScheme = 'light';
      }
      localStorage.setItem('vnr_theme', theme);
    } catch (e) {
      console.error(e);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext) || defaultThemeValue;
