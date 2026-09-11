import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, KeyRound } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { user, isFirebaseActive, logout } = useAuth();
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;
  if (!user) return null;

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in">
      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl w-full max-w-md shadow-2xl overflow-hidden text-[var(--text-primary)] flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[var(--bg-secondary)] border-b border-[var(--card-border)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] flex items-center justify-center text-[var(--text-secondary)]">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[var(--text-primary)]">
                Minha Conta
              </h2>
              <p className="text-[11px] text-[var(--text-muted)]">
                {isFirebaseActive ? 'Sincronização em Nuvem Ativa' : 'Modo Local'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4">
          <div className="p-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--card-border)] flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--card-bg)] border border-[var(--card-border)] flex items-center justify-center text-[var(--text-primary)] font-bold text-base shadow-sm">
              {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="truncate flex-1">
              <p className="font-semibold text-sm text-[var(--text-primary)] truncate">
                {user.displayName || 'Usuário'}
              </p>
              <p className="text-xs text-[var(--text-muted)] truncate">
                {user.email || 'Conta Autenticada'}
              </p>
              <span className="badge bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 mt-1 inline-block">
                Sessão Ativa
              </span>
            </div>
          </div>

          {!isFirebaseActive && (
            <div className="p-3 rounded-md bg-[var(--bg-secondary)] border border-[var(--card-border)] text-xs text-[var(--text-secondary)] space-y-1">
              <p className="font-semibold text-[var(--text-primary)]">ℹ️ Modo Local:</p>
              <p>Seus dados estão sendo salvos com segurança no armazenamento local do seu navegador.</p>
            </div>
          )}

          <button
            onClick={handleLogout}
            disabled={loading}
            className="w-full btn btn-danger text-xs py-2.5 transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Encerrando sessão...' : 'Sair da Conta (Logout)'}
          </button>
        </div>

      </div>
    </div>
  );
};
