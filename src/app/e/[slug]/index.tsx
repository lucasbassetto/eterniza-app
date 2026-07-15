import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ApiError } from '@/api/client';
import { getEventBySlug } from '@/api/events';
import { Input } from '@/components/input';
import { Screen } from '@/components/screen';
import { Text } from '@/components/text';
import { colors, spacing } from '@/theme/theme';

/** Convite do evento (composição tipográfica — ref. AD-007 landing_6, sem foto: EventResponse não traz asset). */
export default function GuestInvite() {
  const { slug } = useLocalSearchParams<{ slug: string }>();

  const eventQuery = useQuery({
    queryKey: ['event', slug],
    queryFn: () => getEventBySlug(slug),
    retry: false,
  });

  if (eventQuery.isPending) {
    return (
      <Screen>
        <View style={styles.content}>
          <Text variant="caption" style={styles.muted}>
            Carregando convite…
          </Text>
        </View>
      </Screen>
    );
  }

  if (eventQuery.isError) {
    const notFound =
      eventQuery.error instanceof ApiError && eventQuery.error.status === 404;
    return (
      <Screen>
        <View style={styles.content}>
          <Text variant="title">{notFound ? 'Convite não encontrado' : 'Algo deu errado'}</Text>
          <Text style={styles.muted}>
            {notFound
              ? 'Este link não corresponde a nenhum evento. Confira o convite ou fale com os anfitriões.'
              : eventQuery.error.message}
          </Text>
        </View>
      </Screen>
    );
  }

  const event = eventQuery.data;

  return (
    <Screen>
      <View style={styles.content}>
        <Text variant="caption" style={styles.kicker}>
          Você foi convidado para
        </Text>
        <Text variant="display">{event.name}</Text>
        <Input
          label="Seu nome"
          placeholder="Como você quer aparecer"
          autoCorrect={false}
          maxLength={30}
        />
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
  kicker: {
    color: colors.inkMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  muted: {
    color: colors.inkMuted,
  },
});
