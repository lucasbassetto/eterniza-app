/**
 * GUEST-01 — Convite do evento com dados reais (spec etapa-5-fluxo-convidado).
 * Backend real = UAT (AD-003); aqui fetch é mockado.
 */
import { screen } from '@testing-library/react-native';
import { renderRouter } from 'expo-router/testing-library';

import { queryClient } from '@/api/query-client';

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
        createdAt: '2026-07-01T12:00:00Z',
      },
    }),
} as Response;

describe('Convite do evento (GUEST-01)', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;
    queryClient.clear(); // o singleton do app persiste entre testes
  });

  it('mostra carregamento enquanto a busca do evento está em voo (AC1)', async () => {
    fetchMock.mockReturnValue(new Promise(() => {})); // nunca resolve
    const view = renderRouter('./src/app', { initialUrl: '/e/ana-e-joao' });
    await view;

    expect(await screen.findByText('Carregando convite…')).toBeOnTheScreen();
  });

  it('evento existe: mostra o convite com o nome do evento e o campo de nome (AC2)', async () => {
    fetchMock.mockResolvedValue(eventOk);
    const view = renderRouter('./src/app', { initialUrl: '/e/ana-e-joao' });
    await view;

    expect(await screen.findByText('Casamento Ana & João')).toBeOnTheScreen();
    expect(screen.getByText('Você foi convidado para')).toBeOnTheScreen();
    expect(screen.getByPlaceholderText('Como você quer aparecer')).toBeOnTheScreen();

    const [url] = fetchMock.mock.calls[0];
    expect(url).toBe('http://test.local:8080/api/events/slug/ana-e-joao');
  });

  it('slug inexistente (404): erro elegante, sem campo de nome (AC3)', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 404,
      json: () =>
        Promise.resolve({ success: false, message: 'Evento não encontrado' }),
    } as Response);
    const view = renderRouter('./src/app', { initialUrl: '/e/slug-que-nao-existe' });
    await view;

    expect(await screen.findByText('Convite não encontrado')).toBeOnTheScreen();
    expect(screen.queryByPlaceholderText('Como você quer aparecer')).toBeNull();
  });

  it('backend inacessível: erro de rede elegante, sem crash nem loading infinito (AC4)', async () => {
    fetchMock.mockRejectedValue(new TypeError('Network request failed'));
    const view = renderRouter('./src/app', { initialUrl: '/e/ana-e-joao' });
    await view;

    expect(await screen.findByText('Algo deu errado')).toBeOnTheScreen();
    expect(
      screen.getByText('Não foi possível falar com o servidor. Verifique sua conexão.'),
    ).toBeOnTheScreen();
    expect(screen.queryByPlaceholderText('Como você quer aparecer')).toBeNull();
  });
});
