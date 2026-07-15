import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { Screen } from '@/components/screen';
import { Text } from '@/components/text';
import { spacing } from '@/theme/theme';

/** Câmera (esqueleto — Etapa 6 traz a VisionCamera; ref. AD-007 landing_2/3). */
export default function GuestCamera() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();

  return (
    <Screen surface="editorial">
      <View style={styles.content}>
        <Text variant="title" onDark>
          Câmera
        </Text>
        <Text variant="caption" onDark>
          evento: {slug}
        </Text>
        <Button title="Voltar" variant="text" onDark onPress={() => router.back()} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.lg,
  },
});
