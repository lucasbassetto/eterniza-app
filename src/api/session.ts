import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'eterniza.host.token';
const EMAIL_KEY = 'eterniza.host.email';
const PASSWORD_KEY = 'eterniza.host.password';

/**
 * Sessão do host. Credenciais ficam no secure store junto com o token
 * para o re-login automático quando o hostToken expira (brief §7).
 */
export interface HostSession {
  token: string;
  email: string;
  password: string;
}

export async function saveSession(session: HostSession): Promise<void> {
  await Promise.all([
    SecureStore.setItemAsync(TOKEN_KEY, session.token),
    SecureStore.setItemAsync(EMAIL_KEY, session.email),
    SecureStore.setItemAsync(PASSWORD_KEY, session.password),
  ]);
}

export async function getSession(): Promise<HostSession | null> {
  const [token, email, password] = await Promise.all([
    SecureStore.getItemAsync(TOKEN_KEY),
    SecureStore.getItemAsync(EMAIL_KEY),
    SecureStore.getItemAsync(PASSWORD_KEY),
  ]);
  return token && email && password ? { token, email, password } : null;
}

export async function updateToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearSession(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(TOKEN_KEY),
    SecureStore.deleteItemAsync(EMAIL_KEY),
    SecureStore.deleteItemAsync(PASSWORD_KEY),
  ]);
}
