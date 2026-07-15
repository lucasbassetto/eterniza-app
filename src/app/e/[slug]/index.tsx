import { Link, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { Screen } from '@/components/screen';
import { Text } from '@/components/text';
import { spacing } from '@/theme/theme';

/** Convite do evento (esqueleto — Etapa 5 traz o conteúdo real; ref. AD-007 landing_6). */
export default function GuestInvite() {
  const { slug } = useLocalSearchParams<{ slug: string }>();

  return (
    <Screen>
      <View style={styles.content}>
        <Text variant="title">Você foi convidado</Text>
        <Text variant="caption">evento: {slug}</Text>
        <Link href={{ pathname: '/e/[slug]/camera', params: { slug } }} asChild>
          <Button title="Câmera" />
        </Link>
        <Link href={{ pathname: '/e/[slug]/gallery', params: { slug } }} asChild>
          <Button title="Galeria" variant="text" />
        </Link>
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
