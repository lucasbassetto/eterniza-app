/**
 * NAV-03 — Deep link abre a rota do convidado (spec etapa-3-navegacao).
 * AC3 (abrir no dispositivo físico) é UAT interativo — AD-003.
 */
import { fireEvent, screen } from '@testing-library/react-native';
import { renderRouter } from 'expo-router/testing-library';

describe('Deep link (NAV-03)', () => {
  it('URL com scheme e caminho /e/{slug} abre o convite com o slug (AC1)', async () => {
    // o ambiente de teste usa o scheme genérico "yourscheme"; o scheme real
    // (eterniza://) é config do app.json e será verificado no dev build (Etapa 6)
    await renderRouter('./src/app', { initialUrl: 'yourscheme:///e/teste-slug' });
    expect(await screen.findByText('Você foi convidado')).toBeOnTheScreen();
    expect(screen.getByText('evento: teste-slug')).toBeOnTheScreen();
  });

  it('slug URL-encoded é exibido decodificado (edge case)', async () => {
    await renderRouter('./src/app', { initialUrl: '/e/ana%2Djoao%2Dx7k2' });
    expect(await screen.findByText('evento: ana-joao-x7k2')).toBeOnTheScreen();
  });

  it('/e/ sem slug cai no unmatched padrão sem crashar (edge case)', async () => {
    await renderRouter('./src/app', { initialUrl: '/e/' });
    expect(await screen.findByTestId('expo-router-unmatched')).toBeOnTheScreen();
  });

  it('voltar da câmera preserva o slug do convite (edge case)', async () => {
    await renderRouter('./src/app', { initialUrl: '/e/teste-slug' });
    await screen.findByText('Você foi convidado');

    await fireEvent.press(screen.getByRole('link', { name: 'Câmera' }));
    await screen.findByText('Câmera', { exact: true });

    await fireEvent.press(screen.getByRole('button', { name: 'Voltar' }));
    expect(await screen.findByText('Você foi convidado')).toBeOnTheScreen();
    expect(screen.getByText('evento: teste-slug')).toBeOnTheScreen();
  });
});
