import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, KeyRound } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { user, isFirebaseActive, signInWithGoogle, signInWithEmail, signUpWithEmail, signInAsGuest, logout } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Erro ao autenticar. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      await signInWithGoogle();
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Erro ao conectar com Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      await signInAsGuest();
      onClose();
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    onClose();
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
                {user ? 'Minha Conta' : 'Entrar no Enxaquecator'}
              </h2>
              <p className="text-[11px] text-[var(--text-muted)]">
                {isFirebaseActive ? 'Sincronização em Nuvem Ativa' : 'Modo Demonstração / Local'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4">
          
          {user ? (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--card-border)] flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--card-bg)] border border-[var(--card-border)] flex items-center justify-center text-[var(--text-primary)] font-bold text-base">
                  {user.displayName?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="truncate flex-1">
                  <p className="font-semibold text-sm text-[var(--text-primary)] truncate">{user.displayName || 'Usuário'}</p>
                  <p className="text-xs text-[var(--text-muted)] truncate">{user.email || 'Conta Anônima / Local'}</p>
                  <span className="badge bg-[rgba(16,185,129,0.1)] text-[var(--color-above)] border border-[rgba(16,185,129,0.2)] mt-1">
                    Conectado
                  </span>
                </div>
              </div>

              {!isFirebaseActive && (
                <div className="p-3 rounded-md bg-[var(--bg-secondary)] border border-[var(--card-border)] text-xs text-[var(--text-secondary)] space-y-1">
                  <p className="font-semibold text-[var(--text-primary)]">ℹ️ Modo Local / Offline:</p>
                  <p>Seus dados estão sendo salvos com segurança no cache local do seu dispositivo.</p>
                </div>
              )}

              <button
                onClick={handleLogout}
                className="w-full btn btn-danger text-xs py-2"
              >
                Encerrar Sessão / Desconectar
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              
              {/* Google Sign In Button */}
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-md bg-[var(--card-bg)] hover:bg-[var(--bg-secondary)] border border-[var(--card-border)] text-[var(--text-primary)] font-medium text-xs sm:text-sm transition-all flex items-center justify-center gap-2.5 shadow-sm disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Continuar com Google</span>
              </button>

              <div className="flex items-center gap-3 my-2">
                <div className="h-px bg-[var(--card-border)] flex-1" />
                <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-semibold">ou com e-mail</span>
                <div className="h-px bg-[var(--card-border)] flex-1" />
              </div>

              {errorMsg && (
                <div className="p-2.5 rounded-md bg-rose-500/10 border border-rose-500/20 text-xs text-[var(--color-below)]">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleEmailAuth} className="space-y-3">
                <div>
                  <label className="form-label">
                    E-mail
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="input-field text-xs"
                  />
                </div>

                <div>
                  <label className="form-label">
                    Senha
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-field text-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn btn-primary text-xs py-2.5 shadow-sm"
                >
                  {mode === 'login' ? 'Entrar' : 'Criar Nova Conta'}
                </button>
              </form>

              <div className="flex items-center justify-between pt-2 text-xs">
                <button
                  onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                  className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium text-[11px]"
                >
                  {mode === 'login' ? 'Criar uma conta' : 'Já tenho uma conta'}
                </button>

                <button
                  onClick={handleGuestLogin}
                  className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-[11px]"
                >
                  Entrar como Anônimo
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
