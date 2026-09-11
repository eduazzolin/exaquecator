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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const cached = localStorage.getItem('enxaquecator_auth_user');
    return cached ? JSON.parse(cached) : null;
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
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
      const demoProfile: UserProfile = {
        uid: 'local-google-user',
        email: 'usuario@google.local',
        displayName: 'Conta Google (Local)',
        isAnonymous: false
      };
      setUser(demoProfile);
      localStorage.setItem('enxaquecator_auth_user', JSON.stringify(demoProfile));
      return;
    }
    await signInWithPopup(auth, googleProvider);
  };

  const signInWithEmail = async (email: string, pass: string) => {
    if (!isFirebaseConfigured || !auth) {
      const name = email.split('@')[0] || 'Usuário';
      const demoProfile: UserProfile = {
        uid: `local-${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
        email,
        displayName: name.charAt(0).toUpperCase() + name.slice(1),
        isAnonymous: false
      };
      setUser(demoProfile);
      localStorage.setItem('enxaquecator_auth_user', JSON.stringify(demoProfile));
      return;
    }
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signUpWithEmail = async (email: string, pass: string) => {
    if (!isFirebaseConfigured || !auth) {
      const name = email.split('@')[0] || 'Usuário';
      const demoProfile: UserProfile = {
        uid: `local-${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
        email,
        displayName: name.charAt(0).toUpperCase() + name.slice(1),
        isAnonymous: false
      };
      setUser(demoProfile);
      localStorage.setItem('enxaquecator_auth_user', JSON.stringify(demoProfile));
      return;
    }
    await createUserWithEmailAndPassword(auth, email, pass);
  };

  const signInAsGuest = async () => {
    if (!isFirebaseConfigured || !auth) {
      const guestProfile: UserProfile = {
        uid: 'local-guest-user',
        email: null,
        displayName: 'Convidado Local',
        isAnonymous: true
      };
      setUser(guestProfile);
      localStorage.setItem('enxaquecator_auth_user', JSON.stringify(guestProfile));
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
