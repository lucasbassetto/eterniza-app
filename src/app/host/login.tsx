import { Href, Link } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { Screen } from '@/components/screen';
import { Text } from '@/components/text';
import { spacing } from '@/theme/theme';

/** Login do host (esqueleto — Etapa 4 traz a autenticação real). */
export default function HostLogin() {
  return (
    <Screen>
      <View style={styles.content}>
        <Text variant="title">Login do host</Text>
        {/* typegen do SDK 54 só oferece "/host/events/index", mas o runtime exige a URL canônica */}
        <Link href={'/host/events' as Href} asChild>
          <Button title="Entrar" />
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
