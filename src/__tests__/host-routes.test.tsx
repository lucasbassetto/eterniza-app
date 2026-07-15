/**
 * NAV-02 — Rotas do host (spec etapa-3-navegacao), atualizado pela Etapa 4:
 * o login esqueleto virou login real (API-03) — a navegação login→eventos é
 * coberta em host-auth.test.tsx; as rotas de eventos exigem sessão (guarda),
 * semeada aqui no secure store mockado.
 */
import { fireEvent, screen } from '@testing-library/react-native';
import { renderRouter } from 'expo-router/testing-library';
import * as SecureStore from 'expo-secure-store';

const secureStoreMock = SecureStore as unknown as {
  __reset: () => void;
  __seed: (entries: Record<string, string>) => void;
};

describe('Rotas do host (NAV-02)', () => {
  beforeEach(() => {
    secureStoreMock.__reset();
    secureStoreMock.__seed({
      'eterniza.host.token': 'tok-guardado',
      'eterniza.host.email': 'ana@eterniza.app',
      'eterniza.host.password': 'segredo',
    });
  });

  it('/host/login renderiza a tela de login (AC1 — navegação real em host-auth.test.tsx)', async () => {
    secureStoreMock.__reset(); // sem sessão para ver o formulário
    await renderRouter('./src/app', { initialUrl: '/host/login' });
    expect(await screen.findByText('Login do host')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeOnTheScreen();
  });

  it('/host/events navega para o evento e o id é exibido (AC2, AC3)', async () => {
    const view = renderRouter('./src/app', { initialUrl: '/host/events' });
    await view;
    expect(await screen.findByText('Meus eventos')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('link', { name: 'Evento de exemplo' }));
    expect(await screen.findByText('id: evento-demo')).toBeOnTheScreen();
    expect(view.getPathname()).toBe('/host/events/evento-demo');
  });

  it('da tela do evento navega para a moderação com o mesmo id (AC2, AC3)', async () => {
    await renderRouter('./src/app', {
      initialUrl: '/host/events/evento-demo',
    });
    expect(await screen.findByText('Evento')).toBeOnTheScreen();
    expect(screen.getByText('id: evento-demo')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('link', { name: 'Moderação' }));
    expect(await screen.findByText('Moderação', { exact: true })).toBeOnTheScreen();
    expect(screen.getByText('id: evento-demo')).toBeOnTheScreen();
  });

  it('/host/events/evento-demo/moderation renderiza direto com o id lido (AC3)', async () => {
    await renderRouter('./src/app', { initialUrl: '/host/events/evento-demo/moderation' });
    expect(await screen.findByText('Moderação')).toBeOnTheScreen();
    expect(screen.getByText('id: evento-demo')).toBeOnTheScreen();
  });
});
