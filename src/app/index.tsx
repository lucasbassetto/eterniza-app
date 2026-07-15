import { Link } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { Screen } from '@/components/screen';
import { Text } from '@/components/text';
import { spacing } from '@/theme/theme';

/** Home (esqueleto — Etapa 10 traz a home real do host; ref. AD-007 landing_9/10). */
export default function Index() {
  return (
    <Screen>
      <View style={styles.content}>
        <Text variant="display">Eterniza</Text>
        <Text>
          A câmera descartável digital para casamentos. Fotografe, guarde o segredo e
          reviva tudo na revelação.
        </Text>
        <Link href="/host/login" asChild>
          <Button title="Sou host" />
        </Link>
        {__DEV__ ? (
          <Link href="/dev/components" asChild>
            <Button title="galeria do design system (dev)" variant="text" />
          </Link>
        ) : null}
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
