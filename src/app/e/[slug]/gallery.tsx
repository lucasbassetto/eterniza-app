import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { Screen } from '@/components/screen';
import { Text } from '@/components/text';
import { spacing } from '@/theme/theme';

/** Galeria do evento (esqueleto — Etapas 8–9 trazem fotos trancadas e revelação; ref. AD-007 landing_1/7/8). */
export default function GuestGallery() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();

  return (
    <Screen surface="editorial">
      <View style={styles.content}>
        <Text variant="title" onDark>
          Galeria
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
