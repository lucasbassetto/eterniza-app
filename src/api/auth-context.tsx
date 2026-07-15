import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { login, type Credentials } from './auth';
import { setSessionExpiredListener } from './host-client';
import { clearSession, getSession, saveSession } from './session';

export type AuthStatus = 'loading' | 'signedIn' | 'signedOut';

interface AuthContextValue {
  status: AuthStatus;
  signIn: (credentials: Credentials) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');

  useEffect(() => {
    let active = true;
    getSession()
      .then((session) => {
        if (active) setStatus(session ? 'signedIn' : 'signedOut');
      })
      .catch(() => {
        if (active) setStatus('signedOut');
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    // Re-login automático falhou (API-04 AC3): sessão limpa → guarda leva ao login
    setSessionExpiredListener(() => setStatus('signedOut'));
    return () => setSessionExpiredListener(null);
  }, []);

  const signIn = async (credentials: Credentials) => {
    const token = await login(credentials);
    await saveSession({ token, ...credentials });
    setStatus('signedIn');
  };

  const signOut = async () => {
    await clearSession();
    setStatus('signedOut');
  };

  return <AuthContext.Provider value={{ status, signIn, signOut }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth precisa estar dentro de <AuthProvider> (ver _layout raiz).');
  }
  return value;
}
