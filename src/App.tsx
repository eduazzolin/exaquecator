import React, { useState, useEffect } from 'react';
import { useData } from './context/DataContext';
import { Navbar } from './components/layout/Navbar';
import { BottomNav } from './components/layout/BottomNav';
import { ToastContainer } from './components/common/ToastContainer';
import { DailyCheckInHero } from './components/crisis/DailyCheckInHero';
import { RecentEpisodesFeed } from './components/crisis/RecentEpisodesFeed';
import { CrisisModal } from './components/crisis/CrisisModal';
import { CalendarView } from './components/calendar/CalendarView';
import { AnalyticsDashboard } from './components/analytics/AnalyticsDashboard';
import { MedicationManager } from './components/medications/MedicationManager';
import { ExportModal } from './components/export/ExportModal';
import { AuthModal } from './components/auth/AuthModal';
import { getTodayDateString } from './utils/dateUtils';

export const App: React.FC = () => {
  const { crises } = useData();

  const [activeTab, setActiveTab] = useState<'timeline' | 'analytics' | 'medications'>('timeline');
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [isCrisisModalOpen, setIsCrisisModalOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Theme state (inspired by budgeter)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') return saved;
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    return 'dark'; // default to dark for formal feel
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);

    // Update theme-color meta tags
    const themeColor = theme === 'dark' ? '#09090b' : '#fafafa';
    const metaTags = document.querySelectorAll('meta[name="theme-color"]');
    if (metaTags.length > 0) {
      metaTags.forEach(meta => meta.setAttribute('content', themeColor));
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleOpenLogModal = (date?: string) => {
    if (date) setSelectedDate(date);
    setIsCrisisModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col pb-24 sm:pb-12 transition-colors duration-200">
      
      {/* Toast Notifications */}
      <ToastContainer />

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Main Container */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 flex-1 w-full space-y-6">
        
        {/* VIEW 1: DIÁRIO (STATUS HERO + CALENDÁRIO COM KPIS + HISTÓRICO RECENTE) */}
        {activeTab === 'timeline' && (
          <div className="space-y-6 animate-in">
            
            {/* 1. Hero Check-in do Dia */}
            <DailyCheckInHero
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              onOpenLogModal={handleOpenLogModal}
            />

            {/* 2. Calendário Interativo Minimalista com Micro-KPIs */}
            <CalendarView
              crises={crises}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              onEditInForm={handleOpenLogModal}
            />

            {/* 3. Feed dos Últimos Episódios */}
            <RecentEpisodesFeed
              crises={crises}
              onSelectDate={setSelectedDate}
              onEditEpisode={handleOpenLogModal}
            />

          </div>
        )}

        {/* VIEW 2: ESTATÍSTICAS */}
        {activeTab === 'analytics' && (
          <div className="animate-in">
            <AnalyticsDashboard
              crises={crises}
              theme={theme}
            />
          </div>
        )}

        {/* VIEW 3: MEDICAMENTOS */}
        {activeTab === 'medications' && (
          <div className="animate-in">
            <MedicationManager />
          </div>
        )}

      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Modals */}
      <CrisisModal
        isOpen={isCrisisModalOpen}
        onClose={() => setIsCrisisModalOpen(false)}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        crises={crises}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

    </div>
  );
};
