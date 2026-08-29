import React, { useState } from 'react';
import { useData } from './context/DataContext';
import { Navbar } from './components/layout/Navbar';
import { BottomNav } from './components/layout/BottomNav';
import { ToastContainer } from './components/common/ToastContainer';
import { CrisisForm } from './components/crisis/CrisisForm';
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
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const handleEditInForm = (date: string) => {
    setSelectedDate(date);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#090b10] text-slate-100 flex flex-col pb-20 sm:pb-10">
      
      {/* Toast Notifications */}
      <ToastContainer />

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Main Container */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-5 flex-1 w-full space-y-6">
        
        {/* VIEW 1: DIÁRIO (FORMULÁRIO NO TOPO + CALENDÁRIO COM DETALHES ABAIXO) */}
        {activeTab === 'timeline' && (
          <div className="space-y-6 animate-in fade-in">
            
            {/* 1. Formulário Completo no Topo */}
            <CrisisForm
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
            />

            {/* 2. Calendário Interativo com Detalhes logo abaixo */}
            <CalendarView
              crises={crises}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              onEditInForm={handleEditInForm}
            />

          </div>
        )}

        {/* VIEW 2: ESTATÍSTICAS */}
        {activeTab === 'analytics' && (
          <AnalyticsDashboard
            crises={crises}
          />
        )}

        {/* VIEW 3: MEDICAMENTOS */}
        {activeTab === 'medications' && (
          <MedicationManager />
        )}

      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Modals */}
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
