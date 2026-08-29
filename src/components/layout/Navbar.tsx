import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  BarChart2, 
  Pill, 
  Download, 
  User, 
  BookOpen
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'timeline' | 'analytics' | 'medications';
  setActiveTab: (tab: 'timeline' | 'analytics' | 'medications') => void;
  onOpenExport: () => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenExport,
  onOpenAuth
}) => {
  const { isFirebaseActive } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        
        {/* Logo with Emoji 🫩 */}
        <div 
          onClick={() => setActiveTab('timeline')}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="w-9 h-9 rounded-xl bg-violet-950/80 border border-violet-800/60 flex items-center justify-center text-xl shadow-md shadow-violet-950/60 group-hover:scale-105 transition-transform">
            🫩
          </div>
          <h1 className="font-bold text-base sm:text-lg text-white tracking-tight flex items-center gap-1.5">
            Enxaquecator
          </h1>
        </div>

        {/* Desktop Tabs */}
        <nav className="hidden sm:flex items-center gap-1 bg-slate-900/60 border border-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'timeline'
                ? 'bg-violet-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" /> Diário & Calendário
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'analytics'
                ? 'bg-violet-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" /> Estatísticas
          </button>

          <button
            onClick={() => setActiveTab('medications')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'medications'
                ? 'bg-violet-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Pill className="w-3.5 h-3.5" /> Medicamentos
          </button>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          
          <button
            onClick={onOpenExport}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Exportar dados e Laudo PDF"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenAuth}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors relative"
            title="Conta / Nuvem"
          >
            <User className="w-4 h-4" />
            {isFirebaseActive && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500" />
            )}
          </button>

        </div>

      </div>
    </header>
  );
};
