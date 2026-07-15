import { Href, Link } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { Screen } from '@/components/screen';
import { Text } from '@/components/text';
import { spacing } from '@/theme/theme';

/** Meus eventos (esqueleto — Etapa 10 traz a lista real; ref. AD-007 landing_9/10). */
export default function HostEvents() {
  return (
    <Screen>
      <View style={styles.content}>
        <Text variant="title">Meus eventos</Text>
        {/* typegen do SDK 54 só oferece ".../[id]/index", mas o runtime exige a URL canônica */}
        <Link
          href={{ pathname: '/host/events/[id]', params: { id: 'evento-demo' } } as unknown as Href}
          asChild
        >
          <Button title="Evento de exemplo" />
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
