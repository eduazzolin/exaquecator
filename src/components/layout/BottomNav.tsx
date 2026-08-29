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
    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/90 px-4 py-2">
      <div className="flex items-center justify-around">
        
        <button
          onClick={() => setActiveTab('timeline')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all ${
            activeTab === 'timeline' ? 'text-violet-400 font-bold' : 'text-slate-500'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[10px]">Diário & Calendário</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all ${
            activeTab === 'analytics' ? 'text-violet-400 font-bold' : 'text-slate-500'
          }`}
        >
          <BarChart2 className="w-5 h-5" />
          <span className="text-[10px]">Estatísticas</span>
        </button>

        <button
          onClick={() => setActiveTab('medications')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all ${
            activeTab === 'medications' ? 'text-violet-400 font-bold' : 'text-slate-500'
          }`}
        >
          <Pill className="w-5 h-5" />
          <span className="text-[10px]">Medicamentos</span>
        </button>

      </div>
    </div>
  );
};
