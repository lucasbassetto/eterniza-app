/**
 * NAV-01 — Rotas do convidado (spec etapa-3-navegacao).
 * NAV-03 AC1/AC2 — o mapeamento URL→tela é o mesmo que o deep link exercita.
 * Desde a Etapa 5 o convite busca o evento real: o "slug lido" se prova pela
 * URL do GET /api/events/slug/{slug} (fetch mockado). A navegação convite→câmera
 * virou fluxo de sessão — coberta em guest-session-flow.test.tsx (GUEST-03).
 */
import { screen } from '@testing-library/react-native';
import { renderRouter } from 'expo-router/testing-library';
import * as SecureStore from 'expo-secure-store';

import { queryClient } from '@/api/query-client';

const secureStoreMock = SecureStore as unknown as {
  __reset: () => void;
  __seed: (entries: Record<string, string>) => void;
};

const eventOk = (name: string) =>
  ({
    ok: true,
    status: 200,
    json: () =>
      Promise.resolve({
        success: true,
        message: 'ok',
        data: {
          id: 'evt-1',
          name,
          slug: 'qualquer',
          qrCodeUrl: 'https://eterniza.app/e/qualquer',
          status: 'ACTIVE',
          revealAt: '2026-08-01T20:00:00Z',
          photoLimitPerGuest: 10,
          photoCount: 0,
          createdAt: '2026-07-01T12:00:00Z',
        },
      }),
  }) as Response;

describe('Rotas do convidado (NAV-01)', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    secureStoreMock.__reset();
    queryClient.clear();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  it('/e/teste-slug renderiza o convite com o slug lido da URL (AC1)', async () => {
    fetchMock.mockResolvedValue(eventOk('Festa Teste'));
    await renderRouter('./src/app', { initialUrl: '/e/teste-slug' });

    expect(await screen.findByText('Festa Teste')).toBeOnTheScreen();
    const [url] = fetchMock.mock.calls[0];
    expect(url).toBe('http://test.local:8080/api/events/slug/teste-slug');
  });

  it('/e/teste-slug/camera renderiza a câmera do slug (AC2 — desde a Etapa 6, com sessão)', async () => {
    secureStoreMock.__seed({
      'eterniza.guest.session.evt-1': JSON.stringify({ token: 'tok', displayName: 'Lia' }),
    });
    fetchMock.mockResolvedValue(eventOk('Festa Teste'));
    await renderRouter('./src/app', { initialUrl: '/e/teste-slug/camera' });

    expect(await screen.findByTestId('poses-counter')).toBeOnTheScreen();
    expect(fetchMock.mock.calls[0][0]).toBe('http://test.local:8080/api/events/slug/teste-slug');
  });

  it('/e/teste-slug/gallery exibe título e o mesmo slug (AC3)', async () => {
    await renderRouter('./src/app', { initialUrl: '/e/teste-slug/gallery' });
    expect(await screen.findByText('Galeria')).toBeOnTheScreen();
    expect(screen.getByText('evento: teste-slug')).toBeOnTheScreen();
  });

  it('slug real com hífens e números é lido integralmente (NAV-03 AC2)', async () => {
    fetchMock.mockResolvedValue(eventOk('Casamento Ana & João'));
    await renderRouter('./src/app', { initialUrl: '/e/casamento-ana-joao-x7k2' });

    await screen.findByText('Casamento Ana & João');
    const [url] = fetchMock.mock.calls[0];
    expect(url).toBe('http://test.local:8080/api/events/slug/casamento-ana-joao-x7k2');
  });
});
