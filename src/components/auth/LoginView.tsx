import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { APP_VERSION } from '../../utils/constants';
import { Sun, Moon, ShieldCheck, Mail, Key } from 'lucide-react';

interface LoginViewProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ theme, onToggleTheme }) => {
  const { isFirebaseActive, signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const formatAuthError = (err: any): string => {
    const code = err?.code || '';
    switch (code) {
      case 'auth/invalid-credential':
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return 'E-mail ou senha incorretos.';
      case 'auth/email-already-in-use':
        return 'Este e-mail já está cadastrado. Tente entrar na sua conta.';
      case 'auth/weak-password':
        return 'A senha deve conter no mínimo 6 caracteres.';
      case 'auth/invalid-email':
        return 'Formato de e-mail inválido.';
      case 'auth/popup-closed-by-user':
        return 'O login do Google foi cancelado antes da conclusão.';
      case 'auth/network-request-failed':
        return 'Falha de conexão com o servidor. Verifique sua internet.';
      default:
        return err?.message || 'Erro ao autenticar. Verifique suas credenciais.';
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await signInWithEmail(email.trim(), password);
      } else {
        await signUpWithEmail(email.trim(), password);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-200">
      
      {/* Top Simple Header */}
      <header className="border-b border-[var(--card-border)] bg-[var(--card-bg)]/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5 select-none">
            <div className="w-8 h-8 rounded-lg border border-[var(--card-border)] flex items-center justify-center overflow-hidden shadow-sm">
              <img src="/favicon.svg" alt="Enxaquecator Logo" className="w-full h-full object-cover" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-semibold text-base text-[var(--text-primary)] tracking-tight">
                Enxaquecator
              </span>
              <span className="text-[10px] font-mono text-[var(--text-muted)]">
                v{APP_VERSION}
              </span>
            </div>
          </div>

          <button
            onClick={onToggleTheme}
            className="p-2 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
            title={theme === 'dark' ? 'Mudar para Tema Claro' : 'Mudar para Tema Escuro'}
            aria-label="Alternar tema"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Center Auth Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-md bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl shadow-xl p-6 sm:p-8 space-y-6 animate-in">
          
          {/* Card Header & Icon */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--card-border)] text-2xl shadow-inner mb-1">
              🌀
            </div>
            <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
              Diário Clínico de Enxaqueca
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-sm mx-auto leading-relaxed">
              Faça login para acessar seu diário, registrar episódios e sincronizar seus dados com segurança.
            </p>
          </div>

          {/* Mode Tabs (Entrar / Criar Conta) */}
          <div className="grid grid-cols-2 p-1 bg-[var(--bg-secondary)] rounded-lg border border-[var(--card-border)] text-xs font-medium">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg('');
              }}
              className={`py-2 rounded-md transition-all ${
                mode === 'login'
                  ? 'bg-[var(--card-bg)] text-[var(--text-primary)] shadow-sm font-semibold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMsg('');
              }}
              className={`py-2 rounded-md transition-all ${
                mode === 'signup'
                  ? 'bg-[var(--card-bg)] text-[var(--text-primary)] shadow-sm font-semibold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              Criar Conta
            </button>
          </div>

          {/* Google Sign In Button */}
          <div>
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--card-border)]/40 border border-[var(--card-border)] text-[var(--text-primary)] font-medium text-xs sm:text-sm transition-all flex items-center justify-center gap-3 shadow-sm disabled:opacity-50 active:scale-[0.99]"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Continuar com Google</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-px bg-[var(--card-border)] flex-1" />
            <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-semibold">
              ou com e-mail
            </span>
            <div className="h-px bg-[var(--card-border)] flex-1" />
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-[var(--color-below)] animate-in">
              {errorMsg}
            </div>
          )}

          {/* Email / Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-3.5">
            <div>
              <label className="form-label flex items-center gap-1.5 mb-1.5">
                <Mail className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                <span>E-mail</span>
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                className="input-field text-xs sm:text-sm py-2.5"
                disabled={loading}
              />
            </div>

            <div>
              <label className="form-label flex items-center gap-1.5 mb-1.5">
                <Key className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                <span>Senha</span>
              </label>
              <input
                type="password"
                required
                minLength={6}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={mode === 'signup' ? 'Mínimo 6 caracteres' : '••••••••'}
                className="input-field text-xs sm:text-sm py-2.5"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn btn-primary text-xs sm:text-sm py-2.5 shadow-sm mt-2 font-medium"
            >
              {loading ? (
                <span>Processando...</span>
              ) : mode === 'login' ? (
                <span>Entrar no Sistema</span>
              ) : (
                <span>Criar Minha Conta</span>
              )}
            </button>
          </form>

          {/* Security & Privacy Notice */}
          <div className="pt-2 border-t border-[var(--card-border)] text-center space-y-1">
            <p className="text-[11px] text-[var(--text-muted)] flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Acesso restrito ao titular da conta</span>
            </p>
            {!isFirebaseActive && (
              <p className="text-[10px] text-[var(--text-muted)] opacity-75">
                Ambiente Local / Modo Offline ativo
              </p>
            )}
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-[var(--text-muted)]">
        <p className="font-mono text-[11px] opacity-75">
          Enxaquecator v{APP_VERSION}
        </p>
      </footer>

    </div>
  );
};
