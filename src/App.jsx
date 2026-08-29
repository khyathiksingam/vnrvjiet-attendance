import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/layout/Header';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

import Dashboard from './pages/Dashboard';
import TakeAttendance from './pages/TakeAttendance';
import History from './pages/History';
import Students from './pages/Students';
import TimetablePage from './pages/TimetablePage';
import Reports from './pages/Reports';

function AppContent() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [preselectedPeriod, setPreselectedPeriod] = useState(null);

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
        {currentTab === 'timetable' && <TimetablePage />}
        {currentTab === 'attendance' && (
          <TakeAttendance 
            preselectedPeriod={preselectedPeriod}
            onAttendanceSaved={() => setPreselectedPeriod(null)}
          />
        )}
        {currentTab === 'history' && <History />}
        {currentTab === 'students' && <Students />}
        {currentTab === 'reports' && <Reports />}
      </main>

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
