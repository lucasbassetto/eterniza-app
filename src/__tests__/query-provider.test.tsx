/**
 * API-02 — TanStack Query configurado no root (spec etapa-4-api-auth).
 * Usa o _layout REAL com uma rota-sonda: se o QueryClientProvider não
 * estiver na árvore, useQuery lança e o teste falha.
 */
import { useQuery } from '@tanstack/react-query';
import { screen } from '@testing-library/react-native';
import { renderRouter } from 'expo-router/testing-library';
import { Text } from 'react-native';

import RootLayout from '../app/_layout';

function Probe() {
  const { data } = useQuery({ queryKey: ['probe'], queryFn: async () => 'dados-ok' });
  return <Text>{data ?? 'carregando'}</Text>;
}

describe('QueryClientProvider (API-02)', () => {
  it('useQuery resolve numa tela sob o _layout real (AC1)', async () => {
    await renderRouter({ _layout: RootLayout, probe: Probe }, { initialUrl: '/probe' });
    expect(await screen.findByText('dados-ok')).toBeOnTheScreen();
  });
});
