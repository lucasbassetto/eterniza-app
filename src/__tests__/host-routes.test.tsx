/**
 * NAV-02 — Rotas do host em esqueleto (spec etapa-3-navegacao).
 * Testes fora de src/app para não virarem rotas do expo-router.
 */
import { fireEvent, screen } from '@testing-library/react-native';
import { renderRouter } from 'expo-router/testing-library';

describe('Rotas do host (NAV-02)', () => {
  it('/host/login renderiza o esqueleto de login e o botão leva a /host/events (AC1)', async () => {
    // getPathname vive no objeto retornado (não no valor resolvido) — manter a referência
    const view = renderRouter('./src/app', { initialUrl: '/host/login' });
    await view;
    expect(await screen.findByText('Login do host')).toBeOnTheScreen();

    // Link asChild expõe role="link"
    await fireEvent.press(screen.getByRole('link', { name: 'Entrar' }));
    expect(await screen.findByText('Meus eventos')).toBeOnTheScreen();
    expect(view.getPathname()).toBe('/host/events');
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
