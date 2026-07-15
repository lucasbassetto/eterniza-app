/**
 * API-03 — Login do host com sessão persistida (spec etapa-4-api-auth).
 * Backend real = UAT (AD-003); aqui fetch e secure store são mockados.
 */
import { act, fireEvent, screen } from '@testing-library/react-native';
import { renderRouter } from 'expo-router/testing-library';
import * as SecureStore from 'expo-secure-store';

import { hostRequest, SessionExpiredError } from '@/api/host-client';

const secureStoreMock = SecureStore as unknown as {
  __reset: () => void;
  __seed: (entries: Record<string, string>) => void;
  __get: (key: string) => string | undefined;
};

const loginOk = {
  ok: true,
  status: 200,
  json: () =>
    Promise.resolve({ success: true, message: 'ok', data: { token: 'tok-novo' } }),
} as Response;

const SESSION = {
  'eterniza.host.token': 'tok-guardado',
  'eterniza.host.email': 'ana@eterniza.app',
  'eterniza.host.password': 'segredo',
};

async function fillAndSubmitLogin() {
  await fireEvent.changeText(screen.getByPlaceholderText('voce@exemplo.com'), 'ana@eterniza.app');
  await fireEvent.changeText(screen.getByPlaceholderText('Sua senha'), 'segredo');
  await fireEvent.press(screen.getByRole('button', { name: 'Entrar' }));
}

describe('Login do host (API-03)', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    secureStoreMock.__reset();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  it('login válido chama a API, guarda token+credenciais e navega para eventos (AC1)', async () => {
    fetchMock.mockResolvedValue(loginOk);
    const view = renderRouter('./src/app', { initialUrl: '/host/login' });
    await view;
    await screen.findByText('Login do host');

    await fillAndSubmitLogin();

    expect(await screen.findByText('Meus eventos')).toBeOnTheScreen();
    expect(view.getPathname()).toBe('/host/events');

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('http://test.local:8080/api/auth/login');
    expect(JSON.parse(init.body)).toEqual({ email: 'ana@eterniza.app', password: 'segredo' });

    expect(secureStoreMock.__get('eterniza.host.token')).toBe('tok-novo');
    expect(secureStoreMock.__get('eterniza.host.email')).toBe('ana@eterniza.app');
    expect(secureStoreMock.__get('eterniza.host.password')).toBe('segredo');
  });

  it('erro de credencial exibe erros por campo e não navega (AC2)', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 400,
      json: () =>
        Promise.resolve({
          success: false,
          message: 'Erro de validação',
          errors: { email: 'E-mail inválido' },
        }),
    } as Response);
    const view = renderRouter('./src/app', { initialUrl: '/host/login' });
    await view;
    await screen.findByText('Login do host');

    await fillAndSubmitLogin();

    expect(await screen.findByText('E-mail inválido')).toBeOnTheScreen();
    expect(view.getPathname()).toBe('/host/login');
    expect(secureStoreMock.__get('eterniza.host.token')).toBeUndefined();
  });

  it('backend inacessível exibe erro de rede elegante, sem crash (AC3)', async () => {
    fetchMock.mockRejectedValue(new TypeError('Network request failed'));
    const view = renderRouter('./src/app', { initialUrl: '/host/login' });
    await view;
    await screen.findByText('Login do host');

    await fillAndSubmitLogin();

    expect(
      await screen.findByText('Não foi possível falar com o servidor. Verifique sua conexão.'),
    ).toBeOnTheScreen();
    expect(view.getPathname()).toBe('/host/login');
  });

  it('com sessão guardada, /host/login redireciona para eventos (AC4/AC5 — persistência)', async () => {
    secureStoreMock.__seed(SESSION);
    const view = renderRouter('./src/app', { initialUrl: '/host/login' });
    await view;

    expect(await screen.findByText('Meus eventos')).toBeOnTheScreen();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('sem sessão, /host/events redireciona para o login (AC4)', async () => {
    const view = renderRouter('./src/app', { initialUrl: '/host/events' });
    await view;

    expect(await screen.findByText('Login do host')).toBeOnTheScreen();
  });

  it('sessão expirada irrecuperável durante o uso: app volta para /host/login (API-04 AC3)', async () => {
    secureStoreMock.__seed(SESSION);
    const view = renderRouter('./src/app', { initialUrl: '/host/events' });
    await view;
    await screen.findByText('Meus eventos');

    // request autenticado encontra 401 e o re-login falha (senha mudou no servidor)
    fetchMock
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.reject(new SyntaxError('empty')),
      } as Response)
      .mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () =>
          Promise.resolve({ success: false, message: 'Credenciais inválidas' }),
      } as Response);

    await act(async () => {
      await expect(hostRequest('/api/events/my')).rejects.toBeInstanceOf(SessionExpiredError);
    });

    // AuthProvider flipa para signedOut → guarda redireciona ao login
    expect(await screen.findByText('Login do host')).toBeOnTheScreen();
    expect(view.getPathname()).toBe('/host/login');
  });
});
