/**
 * NAV-01 — Rotas do convidado em esqueleto (spec etapa-3-navegacao).
 * NAV-03 AC1/AC2 — o mapeamento URL→tela é o mesmo que o deep link exercita.
 * Testes fora de src/app para não virarem rotas do expo-router.
 * renderRouter é aguardado (RNTL v14: render assíncrono); screen importado
 * direto da RNTL (o reexport do expo-router pode reter o stub inicial).
 */
import { screen } from '@testing-library/react-native';
import { renderRouter } from 'expo-router/testing-library';

describe('Rotas do convidado (NAV-01)', () => {
  it('/e/teste-slug renderiza o convite com o slug lido (AC1)', async () => {
    await renderRouter('./src/app', { initialUrl: '/e/teste-slug' });
    expect(await screen.findByText('Você foi convidado')).toBeOnTheScreen();
    expect(screen.getByText('evento: teste-slug')).toBeOnTheScreen();
  });

  it('/e/teste-slug/camera exibe título e o mesmo slug (AC2)', async () => {
    await renderRouter('./src/app', { initialUrl: '/e/teste-slug/camera' });
    expect(await screen.findByText('Câmera')).toBeOnTheScreen();
    expect(screen.getByText('evento: teste-slug')).toBeOnTheScreen();
  });

  it('/e/teste-slug/gallery exibe título e o mesmo slug (AC3)', async () => {
    await renderRouter('./src/app', { initialUrl: '/e/teste-slug/gallery' });
    expect(await screen.findByText('Galeria')).toBeOnTheScreen();
    expect(screen.getByText('evento: teste-slug')).toBeOnTheScreen();
  });

  it('slug real com hífens e números é lido integralmente (NAV-03 AC2)', async () => {
    await renderRouter('./src/app', { initialUrl: '/e/casamento-ana-joao-x7k2' });
    expect(await screen.findByText('evento: casamento-ana-joao-x7k2')).toBeOnTheScreen();
  });
});
