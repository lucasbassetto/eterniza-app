/**
 * API-04 — Re-login automático na expiração do hostToken (spec etapa-4-api-auth).
 */
import * as SecureStore from 'expo-secure-store';

import { ApiError, NetworkError } from '../client';
import { hostRequest, SessionExpiredError, setSessionExpiredListener } from '../host-client';

const secureStoreMock = SecureStore as unknown as {
  __reset: () => void;
  __seed: (entries: Record<string, string>) => void;
  __get: (key: string) => string | undefined;
};

const SESSION = {
  'eterniza.host.token': 'tok-expirado',
  'eterniza.host.email': 'ana@eterniza.app',
  'eterniza.host.password': 'segredo',
};

const json = (status: number, body: unknown) =>
  ({ ok: status < 300, status, json: () => Promise.resolve(body) }) as Response;

const empty401 = () =>
  ({ ok: false, status: 401, json: () => Promise.reject(new SyntaxError('empty')) }) as Response;

const eventsOk = json(200, { success: true, message: 'ok', data: [{ id: 'ev-1' }] });
const loginOk = json(200, { success: true, message: 'ok', data: { token: 'tok-novo' } });
const loginFail = json(400, { success: false, message: 'Credenciais inválidas' });

describe('hostRequest (API-04)', () => {
  const fetchMock = jest.fn();
  const expiredListener = jest.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    expiredListener.mockReset();
    secureStoreMock.__reset();
    secureStoreMock.__seed(SESSION);
    global.fetch = fetchMock as unknown as typeof fetch;
    setSessionExpiredListener(expiredListener);
  });

  afterEach(() => {
    setSessionExpiredListener(null);
  });

  it('401 → re-loga com credenciais guardadas e repete o request uma vez (AC1/AC2)', async () => {
    fetchMock
      .mockResolvedValueOnce(empty401())
      .mockResolvedValueOnce(loginOk)
      .mockResolvedValueOnce(eventsOk);

    await expect(hostRequest('/api/events/my')).resolves.toEqual([{ id: 'ev-1' }]);

    expect(fetchMock).toHaveBeenCalledTimes(3);
    const [loginUrl, loginInit] = fetchMock.mock.calls[1];
    expect(loginUrl).toBe('http://test.local:8080/api/auth/login');
    expect(JSON.parse(loginInit.body)).toEqual({
      email: 'ana@eterniza.app',
      password: 'segredo',
    });
    const [, retryInit] = fetchMock.mock.calls[2];
    expect(retryInit.headers.Authorization).toBe('Bearer tok-novo');

    // novo token substituiu o antigo no secure store (AC2)
    expect(secureStoreMock.__get('eterniza.host.token')).toBe('tok-novo');
    expect(expiredListener).not.toHaveBeenCalled();
  });

  it('re-login falha → limpa a sessão e notifica para voltar ao login (AC3)', async () => {
    fetchMock.mockResolvedValueOnce(empty401()).mockResolvedValueOnce(loginFail);

    await expect(hostRequest('/api/events/my')).rejects.toBeInstanceOf(SessionExpiredError);

    expect(secureStoreMock.__get('eterniza.host.token')).toBeUndefined();
    expect(secureStoreMock.__get('eterniza.host.email')).toBeUndefined();
    expect(secureStoreMock.__get('eterniza.host.password')).toBeUndefined();
    expect(expiredListener).toHaveBeenCalledTimes(1);
  });

  it('401 também no retry propaga sem um segundo re-login — sem loop (AC4)', async () => {
    fetchMock
      .mockResolvedValueOnce(empty401())
      .mockResolvedValueOnce(loginOk)
      .mockResolvedValueOnce(empty401());

    const error = (await hostRequest('/api/events/my').catch((e) => e)) as ApiError;
    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(401);
    // exatamente 3 chamadas: original, 1 login, 1 retry — nunca um 2º login
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('falha de rede não dispara re-login (passthrough)', async () => {
    fetchMock.mockRejectedValue(new TypeError('Network request failed'));

    await expect(hostRequest('/api/events/my')).rejects.toBeInstanceOf(NetworkError);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('sem sessão guardada: SessionExpiredError e notificação (guarda de borda)', async () => {
    secureStoreMock.__reset();

    await expect(hostRequest('/api/events/my')).rejects.toBeInstanceOf(SessionExpiredError);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(expiredListener).toHaveBeenCalledTimes(1);
  });
});
