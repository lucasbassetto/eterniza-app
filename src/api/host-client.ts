import { login } from './auth';
import { ApiError, request, type RequestOptions } from './client';
import { clearSession, getSession, updateToken } from './session';

/** Sessão irrecuperável: re-login falhou (ou não há sessão) — voltar ao login. */
export class SessionExpiredError extends Error {
  constructor() {
    super('Sua sessão expirou. Entre novamente.');
    this.name = 'SessionExpiredError';
  }
}

type SessionExpiredListener = () => void;
let onSessionExpired: SessionExpiredListener | null = null;

/** O AuthProvider registra aqui como reagir (status → signedOut → guarda redireciona). */
export function setSessionExpiredListener(listener: SessionExpiredListener | null): void {
  onSessionExpired = listener;
}

/**
 * Request autenticado do host. Em 401 (hostToken expira em 24h — brief §7):
 * re-loga com as credenciais guardadas e repete o request original UMA única
 * vez. Se o re-login falhar, limpa a sessão e notifica (volta ao login).
 * Um 401 no retry propaga — nunca dispara um segundo re-login (sem loop).
 */
export async function hostRequest<T>(
  path: string,
  options: Omit<RequestOptions, 'token'> = {},
): Promise<T> {
  const session = await getSession();
  if (!session) {
    onSessionExpired?.();
    throw new SessionExpiredError();
  }

  try {
    return await request<T>(path, { ...options, token: session.token });
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) {
      throw error;
    }

    let newToken: string;
    try {
      newToken = await login({ email: session.email, password: session.password });
    } catch {
      await clearSession();
      onSessionExpired?.();
      throw new SessionExpiredError();
    }

    await updateToken(newToken);
    return request<T>(path, { ...options, token: newToken });
  }
}
