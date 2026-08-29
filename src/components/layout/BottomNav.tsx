import React from 'react';
import { BookOpen, BarChart2, Pill } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'timeline' | 'analytics' | 'medications';
  setActiveTab: (tab: 'timeline' | 'analytics' | 'medications') => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab
}) => {
  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--card-bg)]/95 backdrop-blur-lg border-t border-[var(--card-border)] px-4 py-2">
      <div className="flex items-center justify-around">
        
        <button
          onClick={() => setActiveTab('timeline')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-lg transition-all ${
            activeTab === 'timeline' 
              ? 'text-[var(--text-primary)] font-semibold' 
              : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[10px]">Diário</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-lg transition-all ${
            activeTab === 'analytics' 
              ? 'text-[var(--text-primary)] font-semibold' 
              : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
          }`}
        >
          <BarChart2 className="w-5 h-5" />
          <span className="text-[10px]">Estatísticas</span>
        </button>

        <button
          onClick={() => setActiveTab('medications')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-lg transition-all ${
            activeTab === 'medications' 
              ? 'text-[var(--text-primary)] font-semibold' 
              : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
          }`}
        >
          <Pill className="w-5 h-5" />
          <span className="text-[10px]">Medicamentos</span>
        </button>

      </div>
    </div>
  );
};
