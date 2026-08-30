import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  BarChart2, 
  Pill, 
  Download, 
  User, 
  BookOpen,
  Sun,
  Moon
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'timeline' | 'analytics' | 'medications';
  setActiveTab: (tab: 'timeline' | 'analytics' | 'medications') => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  onOpenExport: () => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  theme = 'dark',
  onToggleTheme,
  onOpenExport,
  onOpenAuth
}) => {
  const { isFirebaseActive, user } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-[var(--card-bg)]/90 backdrop-blur-md border-b border-[var(--card-border)] transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-15 py-3 flex items-center justify-between gap-4">
        
        {/* Brand Logo & Name */}
        <div 
          onClick={() => setActiveTab('timeline')}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="w-8 h-8 rounded-lg bg-[var(--bg-secondary)] border border-[var(--card-border)] flex items-center justify-center shadow-sm transition-transform group-hover:scale-105 overflow-hidden">
            <img src="/favicon.svg" alt="Enxaquecator Logo" className="w-5 h-5 object-contain select-none pointer-events-none" />
          </div>
          <span className="font-semibold text-sm sm:text-base text-[var(--text-primary)] tracking-tight">
            Enxaquecator
          </span>
        </div>

        {/* Desktop Segmented Navigation */}
        <nav className="hidden sm:flex items-center gap-1 bg-[var(--bg-secondary)] border border-[var(--card-border)] p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'timeline'
                ? 'bg-[var(--color-primary)] text-[var(--bg-primary)] shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Diário & Calendário</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'analytics'
                ? 'bg-[var(--color-primary)] text-[var(--bg-primary)] shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Estatísticas</span>
          </button>

          <button
            onClick={() => setActiveTab('medications')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'medications'
                ? 'bg-[var(--color-primary)] text-[var(--bg-primary)] shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Pill className="w-3.5 h-3.5" />
            <span>Medicamentos</span>
          </button>
        </nav>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          
          {/* Theme Switcher */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
              title={theme === 'dark' ? 'Mudar para Tema Claro' : 'Mudar para Tema Escuro'}
              aria-label="Alternar tema"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          )}

          {/* Export Button */}
          <button
            onClick={onOpenExport}
            className="p-2 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
            title="Exportar dados e Laudo Médico PDF"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Auth Button */}
          <button
            onClick={onOpenAuth}
            className="p-2 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all relative"
            title={user ? `Conectado como ${user.displayName || user.email}` : 'Entrar / Sincronizar Nuvem'}
          >
            <User className="w-4 h-4" />
            {isFirebaseActive && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-[var(--card-bg)]" />
            )}
          </button>

        </div>

      </div>
    </header>
  );
};
