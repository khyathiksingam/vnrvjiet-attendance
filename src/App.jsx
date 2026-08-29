import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/layout/Header';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

import Dashboard from './pages/Dashboard';
import TakeAttendance from './pages/TakeAttendance';
import History from './pages/History';
import Students from './pages/Students';
import TimetablePage from './pages/TimetablePage';
import Reports from './pages/Reports';
import Login from './pages/Login';

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [preselectedPeriod, setPreselectedPeriod] = useState(null);

  if (!isAuthenticated) {
    return <Login />;
  }

  const handleSelectSubjectForAttendance = (period) => {
    setPreselectedPeriod(period);
    setCurrentTab('attendance');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
      <Header />
      <Navbar currentTab={currentTab} setTab={setCurrentTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentTab === 'dashboard' && (
          <Dashboard 
            setTab={setCurrentTab} 
            onSelectSubjectForAttendance={handleSelectSubjectForAttendance} 
          />
        )}
        {currentTab === 'timetable' && <TimetablePage setTab={setCurrentTab} />}
        {currentTab === 'attendance' && (
          <TakeAttendance 
            setTab={setCurrentTab}
            preselectedPeriod={preselectedPeriod}
            onAttendanceSaved={() => setPreselectedPeriod(null)}
          />
        )}
        {currentTab === 'history' && <History setTab={setCurrentTab} />}
        {currentTab === 'students' && <Students setTab={setCurrentTab} />}
        {currentTab === 'reports' && <Reports setTab={setCurrentTab} />}
      </main>

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
