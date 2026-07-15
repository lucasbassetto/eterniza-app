/**
 * GUEST-03 — Sessão do convidado, fluxo ponta-a-ponta (spec etapa-5-fluxo-convidado).
 * Testa a fiação completa: convite → nome → POST /auth/guest/session → câmera (L-002).
 * Backend real = UAT (AD-003); aqui fetch, secure store e crypto são mockados.
 */
import { fireEvent, screen } from '@testing-library/react-native';
import { renderRouter } from 'expo-router/testing-library';
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

import { __resetDeviceIdCache } from '@/api/device-id';
import { queryClient } from '@/api/query-client';

const secureStoreMock = SecureStore as unknown as {
  __reset: () => void;
  __seed: (entries: Record<string, string>) => void;
  __get: (key: string) => string | undefined;
};

const cryptoMock = Crypto as unknown as { __resetRandomUUID: () => void };

const eventOk = {
  ok: true,
  status: 200,
  json: () =>
    Promise.resolve({
      success: true,
      message: 'ok',
      data: {
        id: 'evt-1',
        name: 'Casamento Ana & João',
        slug: 'ana-e-joao',
        qrCodeUrl: 'https://eterniza.app/e/ana-e-joao',
        status: 'ACTIVE',
        revealAt: '2026-08-01T20:00:00Z',
        photoLimitPerGuest: 10,
        photoCount: 3,
        coverImageUrl: null,
        createdAt: '2026-07-01T12:00:00Z',
      },
    }),
} as Response;

const sessionOk = {
  ok: true,
  status: 200,
  json: () => Promise.resolve({ success: true, message: 'ok', data: 'guest-tok-1' }),
} as Response;

const SESSION_KEY = 'eterniza.guest.session.evt-1';

describe('Sessão do convidado — fluxo completo (GUEST-03)', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    secureStoreMock.__reset();
    cryptoMock.__resetRandomUUID();
    __resetDeviceIdCache();
    queryClient.clear();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  // Embrulhado em objeto: o resultado do renderRouter é thenable e o await do
  // caller o desembrulharia de novo, perdendo os métodos (getPathname etc.)
  async function openInvite() {
    const view = renderRouter('./src/app', { initialUrl: '/e/ana-e-joao' });
    await view;
    await screen.findByText('Casamento Ana & João');
    return { view };
  }

  it('nome válido: POST com displayName+eventId+deviceId, guarda o token e navega para a câmera (AC1)', async () => {
    fetchMock.mockResolvedValueOnce(eventOk).mockResolvedValueOnce(sessionOk);
    const { view } = await openInvite();

    // espaços nas pontas são aparados antes de validar e enviar (edge case)
    await fireEvent.changeText(screen.getByPlaceholderText('Como você quer aparecer'), '  Lia  ');
    await fireEvent.press(screen.getByRole('button', { name: 'Ir para a câmera' }));

    expect(await screen.findByTestId('poses-counter')).toBeOnTheScreen();
    expect(view.getPathname()).toBe('/e/ana-e-joao/camera');

    const [url, init] = fetchMock.mock.calls[1];
    expect(url).toBe('http://test.local:8080/api/auth/guest/session');
    expect(JSON.parse(init.body)).toEqual({
      displayName: 'Lia',
      eventId: 'evt-1', // id do EventResponse, nunca o slug (regra 8 do brief)
      deviceId: 'uuid-teste-1',
    });

    expect(JSON.parse(secureStoreMock.__get(SESSION_KEY)!)).toEqual({
      token: 'guest-tok-1',
      displayName: 'Lia',
    });
    expect(secureStoreMock.__get('eterniza.guest.deviceId')).toBe('uuid-teste-1');
  });

  it('nome vazio (ou só espaços): bloqueia o envio com erro no campo, sem chamar a API (AC2)', async () => {
    fetchMock.mockResolvedValueOnce(eventOk);
    const { view } = await openInvite();

    await fireEvent.changeText(screen.getByPlaceholderText('Como você quer aparecer'), '   ');
    await fireEvent.press(screen.getByRole('button', { name: 'Ir para a câmera' }));

    expect(await screen.findByText('Diga seu nome para entrar.')).toBeOnTheScreen();
    expect(fetchMock).toHaveBeenCalledTimes(1); // só o GET do evento
    expect(view.getPathname()).toBe('/e/ana-e-joao');
  });

  it('nome acima de 30 caracteres: bloqueia o envio com erro no campo (AC2)', async () => {
    fetchMock.mockResolvedValueOnce(eventOk);
    await openInvite();

    await fireEvent.changeText(
      screen.getByPlaceholderText('Como você quer aparecer'),
      'a'.repeat(31),
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Ir para a câmera' }));

    expect(await screen.findByText('Máximo de 30 caracteres.')).toBeOnTheScreen();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('backend rejeita o payload (400): exibe o erro do envelope, sem navegar (AC3)', async () => {
    fetchMock.mockResolvedValueOnce(eventOk).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: () =>
        Promise.resolve({
          success: false,
          message: 'Erro de validação',
          errors: { displayName: 'Nome é obrigatório' },
        }),
    } as Response);
    const { view } = await openInvite();

    await fireEvent.changeText(screen.getByPlaceholderText('Como você quer aparecer'), 'Lia');
    await fireEvent.press(screen.getByRole('button', { name: 'Ir para a câmera' }));

    expect(await screen.findByText('Nome é obrigatório')).toBeOnTheScreen();
    expect(view.getPathname()).toBe('/e/ana-e-joao');
    expect(secureStoreMock.__get(SESSION_KEY)).toBeUndefined();
  });

  it('sessão já existente para o evento: pula a tela de nome direto para a câmera (AC4)', async () => {
    secureStoreMock.__seed({
      [SESSION_KEY]: JSON.stringify({ token: 'guest-tok-antigo', displayName: 'Lia' }),
    });
    fetchMock.mockResolvedValueOnce(eventOk);
    const view = renderRouter('./src/app', { initialUrl: '/e/ana-e-joao' });
    await view;

    expect(await screen.findByTestId('poses-counter')).toBeOnTheScreen();
    expect(view.getPathname()).toBe('/e/ana-e-joao/camera');
    expect(fetchMock).toHaveBeenCalledTimes(1); // só o GET do evento, sem novo POST de sessão
  });
});
