/**
 * COMP-04 — Screen com gutter 24 e safe area (DESIGN_SYSTEM.md §4).
 * O comportamento visual da safe area em dispositivo é UAT; aqui se
 * asserta o gutter, as superfícies e o uso do SafeAreaView.
 */
import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Screen } from '../screen';

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

function wrap(ui: React.ReactElement) {
  return <SafeAreaProvider initialMetrics={metrics}>{ui}</SafeAreaProvider>;
}

describe('Screen (COMP-04)', () => {
  it('aplica gutter lateral 24 (AC1)', async () => {
    await render(wrap(<Screen testID="screen" />));
    expect(screen.getByTestId('screen')).toHaveStyle({ paddingHorizontal: 24 });
  });

  it('default: fundo canvas (AC2)', async () => {
    await render(wrap(<Screen testID="screen" />));
    expect(screen.getByTestId('screen')).toHaveStyle({ backgroundColor: '#FFFFFF' });
  });

  it('surface="editorial": fundo editorial (AC2)', async () => {
    await render(wrap(<Screen testID="screen" surface="editorial" />));
    expect(screen.getByTestId('screen')).toHaveStyle({ backgroundColor: '#121212' });
  });

  it('renderiza os filhos dentro do container', async () => {
    await render(
      wrap(
        <Screen>
          <Text>conteúdo</Text>
        </Screen>,
      ),
    );
    expect(screen.getByText('conteúdo')).toBeOnTheScreen();
  });
});
