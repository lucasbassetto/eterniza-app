import { StyleSheet, ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing } from '@/theme/theme';

export interface ScreenProps extends ViewProps {
  /** Superfície da tela (§2): canvas para fluxos, editorial para shell escuro. */
  surface?: 'canvas' | 'editorial';
}

export function Screen({ surface = 'canvas', style, children, ...rest }: ScreenProps) {
  return (
    <SafeAreaView {...rest} style={[styles.base, { backgroundColor: colors[surface] }, style]}>
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
    // Gutter lateral de 24 — inegociável em qualquer viewport (§4)
    paddingHorizontal: spacing.xxl,
  },
});
