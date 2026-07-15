import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { Screen } from '@/components/screen';
import { Text } from '@/components/text';
import { spacing } from '@/theme/theme';

/** Moderação (esqueleto — Etapa 10 traz a grade de fotos e o apagar). */
export default function HostModeration() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  return (
    <Screen>
      <View style={styles.content}>
        <Text variant="title">Moderação</Text>
        <Text variant="caption">id: {id}</Text>
        <Button title="Voltar" variant="text" onPress={() => router.back()} />
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
