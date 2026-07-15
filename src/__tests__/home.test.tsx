/**
 * NAV-04 — Home como hub esqueleto (spec etapa-3-navegacao).
 */
import { fireEvent, screen } from '@testing-library/react-native';
import { renderRouter } from 'expo-router/testing-library';

describe('Home hub (NAV-04)', () => {
  it('exibe "Sou host" navegando para /host/login (AC1)', async () => {
    const view = renderRouter('./src/app', { initialUrl: '/' });
    await view;
    expect(await screen.findByText('Eterniza')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('link', { name: 'Sou host' }));
    expect(await screen.findByText('Login do host')).toBeOnTheScreen();
    expect(view.getPathname()).toBe('/host/login');
  });

  it('o link "componentes →" da Etapa 2 foi removido (AC2)', async () => {
    await renderRouter('./src/app', { initialUrl: '/' });
    await screen.findByText('Eterniza');
    expect(screen.queryByText('componentes →')).toBeNull();
  });

  it('acesso à galeria existe em __DEV__ (AC2 — o "apenas" é o gate __DEV__ no código)', async () => {
    await renderRouter('./src/app', { initialUrl: '/' });
    // no jest __DEV__ é true; o gate de produção é a condicional __DEV__ em index.tsx
    expect(await screen.findByText('galeria do design system (dev)')).toBeOnTheScreen();
  });
});
