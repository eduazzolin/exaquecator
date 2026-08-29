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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden text-slate-100 flex flex-col">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                {user ? 'Minha Conta & Nuvem' : 'Entrar no Enxaquecator'}
              </h2>
              <p className="text-xs text-slate-400">
                {isFirebaseActive ? 'Sincronização Firebase Ativa' : 'Modo Demonstração / Local'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-5">
          
          {user ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-brand-600/30 border border-brand-500/40 flex items-center justify-center text-brand-300 font-bold text-lg">
                  {user.displayName?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="truncate flex-1">
                  <p className="font-bold text-white truncate">{user.displayName}</p>
                  <p className="text-xs text-slate-400 truncate">{user.email || 'Conta Anônima / Local'}</p>
                  <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    Sessão Conectada
                  </span>
                </div>
              </div>

              {!isFirebaseActive && (
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-1">
                  <p className="font-bold text-brand-300">ℹ️ Modo Demonstração / Local:</p>
                  <p>Seus dados estão sendo salvos com segurança no cache local do seu navegador. Para conectar ao seu Firebase em produção, preencha o arquivo <code className="text-brand-400">.env</code> com as chaves do Firebase Console.</p>
                </div>
              )}

              <button
                onClick={handleLogout}
                className="w-full py-2.5 rounded-xl border border-rose-500/40 bg-rose-950/20 hover:bg-rose-950/40 text-rose-300 text-xs font-bold transition-colors"
              >
                Encerrar Sessão / Trocar Usuário
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              
              {/* Google Sign In Button */}
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm transition-all flex items-center justify-center gap-3 shadow-md disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Continuar com Google</span>
              </button>

              <div className="flex items-center gap-3 my-3">
                <div className="h-px bg-slate-800 flex-1" />
                <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">ou com e-mail</span>
                <div className="h-px bg-slate-800 flex-1" />
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-xs text-rose-300">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleEmailAuth} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    E-mail
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:border-brand-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Senha
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:border-brand-500 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-md transition-all disabled:opacity-50"
                >
                  {mode === 'login' ? 'Entrar com E-mail' : 'Criar Nova Conta'}
                </button>
              </form>

              <div className="flex items-center justify-between pt-2 text-xs">
                <button
                  onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                  className="text-brand-400 hover:text-brand-300 font-semibold"
                >
                  {mode === 'login' ? 'Não tem conta? Cadastre-se' : 'Já possui conta? Faça login'}
                </button>

                <button
                  onClick={handleGuestLogin}
                  className="text-slate-400 hover:text-slate-200"
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
