import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, type } from '@/theme/theme';

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={[type.display, styles.title]}>Eterniza</Text>
      <Text style={[type.body, styles.body]}>
        A câmera descartável digital para casamentos. Fotografe, guarde o segredo e
        reviva tudo na revelação.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
    paddingHorizontal: spacing.xxl,
    justifyContent: 'center',
    gap: spacing.lg,
  },
  title: {
    color: colors.ink,
  },
  body: {
    color: colors.inkMuted,
  },
});
