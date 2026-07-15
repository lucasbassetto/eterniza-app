import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { Screen } from '@/components/screen';
import { Text } from '@/components/text';
import { spacing } from '@/theme/theme';

/** Tela do evento do host (esqueleto — Etapa 10 traz QR, photoCount e reveal; ref. AD-007 landing_5). */
export default function HostEvent() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  return (
    <Screen>
      <View style={styles.content}>
        <Text variant="title">Evento</Text>
        <Text variant="caption">id: {id}</Text>
        <Link href={{ pathname: '/host/events/[id]/moderation', params: { id } }} asChild>
          <Button title="Moderação" />
        </Link>
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
