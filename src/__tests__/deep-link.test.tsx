/**
 * NAV-03 — Deep link abre a rota do convidado (spec etapa-3-navegacao).
 * AC3 (abrir no dispositivo físico) é UAT interativo — AD-003.
 * Desde a Etapa 5 o convite busca o evento real: o "slug lido" se prova pela
 * URL do GET /api/events/slug/{slug} (fetch mockado).
 */
import { screen } from '@testing-library/react-native';
import { renderRouter } from 'expo-router/testing-library';
import * as SecureStore from 'expo-secure-store';

import { __resetDeviceIdCache } from '@/api/device-id';
import { queryClient } from '@/api/query-client';

const secureStoreMock = SecureStore as unknown as {
  __reset: () => void;
  __seed: (entries: Record<string, string>) => void;
};

const eventOk = {
  ok: true,
  status: 200,
  json: () =>
    Promise.resolve({
      success: true,
      message: 'ok',
      data: {
        id: 'evt-1',
        name: 'Festa Teste',
        slug: 'qualquer',
        qrCodeUrl: 'https://eterniza.app/e/qualquer',
        status: 'ACTIVE',
        revealAt: '2026-08-01T20:00:00Z',
        photoLimitPerGuest: 10,
        photoCount: 0,
        createdAt: '2026-07-01T12:00:00Z',
      },
    }),
} as Response;

describe('Deep link (NAV-03)', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    secureStoreMock.__reset();
    __resetDeviceIdCache();
    queryClient.clear();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  it('URL com scheme e caminho /e/{slug} abre o convite com o slug (AC1)', async () => {
    // o ambiente de teste usa o scheme genérico "yourscheme"; o scheme real
    // (eterniza://) é config do app.json e será verificado no dev build (Etapa 6)
    fetchMock.mockResolvedValue(eventOk);
    await renderRouter('./src/app', { initialUrl: 'yourscheme:///e/teste-slug' });

    expect(await screen.findByText('Festa Teste')).toBeOnTheScreen();
    expect(fetchMock.mock.calls[0][0]).toBe('http://test.local:8080/api/events/slug/teste-slug');
  });

  it('slug URL-encoded chega decodificado na busca do evento (edge case)', async () => {
    fetchMock.mockResolvedValue(eventOk);
    await renderRouter('./src/app', { initialUrl: '/e/ana%2Djoao%2Dx7k2' });

    await screen.findByText('Festa Teste');
    expect(fetchMock.mock.calls[0][0]).toBe(
      'http://test.local:8080/api/events/slug/ana-joao-x7k2',
    );
  });

  it('/e/ sem slug cai no unmatched padrão sem crashar (edge case)', async () => {
    await renderRouter('./src/app', { initialUrl: '/e/' });
    expect(await screen.findByTestId('expo-router-unmatched')).toBeOnTheScreen();
  });

  it('deep link com sessão ativa cai direto na câmera — slug preservado (edge case)', async () => {
    // Reabrir o link do QR com sessão salva pula a tela de nome (GUEST-03 AC4)
    secureStoreMock.__seed({
      'eterniza.guest.session.evt-1': JSON.stringify({ token: 'tok', displayName: 'Lia' }),
    });
    fetchMock.mockResolvedValueOnce(eventOk);
    const view = renderRouter('./src/app', { initialUrl: 'yourscheme:///e/teste-slug' });
    await view;

    expect(await screen.findByTestId('poses-counter')).toBeOnTheScreen();
    expect(view.getPathname()).toBe('/e/teste-slug/camera');
  });
});
