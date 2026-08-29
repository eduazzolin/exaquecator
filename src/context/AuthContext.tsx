import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInAnonymously, 
  signOut,
  User 
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../services/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isFirebaseActive: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string) => Promise<void>;
  signInAsGuest: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER: UserProfile = {
  uid: 'demo-local-user',
  email: 'usuario.demo@enxaquecator.app',
  displayName: 'Usuário Local (Modo Demo)',
  isAnonymous: true
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    if (!isFirebaseConfigured) return DEMO_USER;
    const cached = localStorage.getItem('enxaquecator_auth_user');
    return cached ? JSON.parse(cached) : null;
  });
  const [loading, setLoading] = useState<boolean>(isFirebaseConfigured);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setUser(DEMO_USER);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: User | null) => {
      if (firebaseUser) {
        const profile: UserProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuário',
          photoURL: firebaseUser.photoURL,
          isAnonymous: firebaseUser.isAnonymous
        };
        setUser(profile);
        localStorage.setItem('enxaquecator_auth_user', JSON.stringify(profile));
      } else {
        setUser(null);
        localStorage.removeItem('enxaquecator_auth_user');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    if (!isFirebaseConfigured || !auth || !googleProvider) {
      setUser({ ...DEMO_USER, displayName: 'Conta Google (Demo)' });
      return;
    }
    await signInWithPopup(auth, googleProvider);
  };

  const signInWithEmail = async (email: string, pass: string) => {
    if (!isFirebaseConfigured || !auth) {
      setUser({ ...DEMO_USER, email, displayName: email.split('@')[0] });
      return;
    }
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signUpWithEmail = async (email: string, pass: string) => {
    if (!isFirebaseConfigured || !auth) {
      setUser({ ...DEMO_USER, email, displayName: email.split('@')[0] });
      return;
    }
    await createUserWithEmailAndPassword(auth, email, pass);
  };

  const signInAsGuest = async () => {
    if (!isFirebaseConfigured || !auth) {
      setUser(DEMO_USER);
      return;
    }
    await signInAnonymously(auth);
  };

  const logout = async () => {
    if (isFirebaseConfigured && auth) {
      await signOut(auth);
    }
    setUser(null);
    localStorage.removeItem('enxaquecator_auth_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isFirebaseActive: isFirebaseConfigured,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signInAsGuest,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
