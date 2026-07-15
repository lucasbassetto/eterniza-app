import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ApiError } from '@/api/client';
import { getEventBySlug } from '@/api/events';
import { createGuestSession } from '@/api/guest';
import { getGuestSession } from '@/api/guest-session';
import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { Screen } from '@/components/screen';
import { Text } from '@/components/text';
import { colors, spacing } from '@/theme/theme';

/** Convite do evento (composição tipográfica — ref. AD-007 landing_6, sem foto: EventResponse não traz asset). */
export default function GuestInvite() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);

  const eventQuery = useQuery({
    queryKey: ['event', slug],
    queryFn: () => getEventBySlug(slug),
    retry: false,
  });
  const event = eventQuery.data;

  // Sessão já criada neste device para este evento: pula a tela de nome
  const sessionQuery = useQuery({
    queryKey: ['guest-session', event?.id],
    queryFn: () => getGuestSession(event!.id),
    enabled: !!event,
  });

  const mutation = useMutation({
    mutationFn: (displayName: string) => createGuestSession(event!.id, displayName),
    onSuccess: (token, displayName) => {
      // Cache da sessão em dia (a câmera lê esta query; staleTime seguraria o null antigo)
      queryClient.setQueryData(['guest-session', event!.id], { token, displayName });
      router.replace({ pathname: '/e/[slug]/camera', params: { slug } });
    },
  });

  if (eventQuery.isPending || (event && sessionQuery.isPending)) {
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

  if (sessionQuery.data) {
    return <Redirect href={{ pathname: '/e/[slug]/camera', params: { slug } }} />;
  }

  const submit = () => {
    const displayName = name.trim();
    if (!displayName) {
      setNameError('Diga seu nome para entrar.');
      return;
    }
    if (displayName.length > 30) {
      setNameError('Máximo de 30 caracteres.');
      return;
    }
    setNameError(null);
    mutation.mutate(displayName);
  };

  const apiError = mutation.error instanceof ApiError ? mutation.error : null;
  const fieldErrors = apiError?.errors ?? {};
  const generalMessage =
    mutation.error && Object.keys(fieldErrors).length === 0 ? mutation.error.message : null;

  return (
    <Screen>
      <View style={styles.content}>
        <Text variant="caption" style={styles.kicker}>
          Você foi convidado para
        </Text>
        <Text variant="display">{event!.name}</Text>
        <Input
          label="Seu nome"
          placeholder="Como você quer aparecer"
          autoCorrect={false}
          maxLength={30}
          value={name}
          onChangeText={setName}
          error={nameError ?? fieldErrors.displayName}
        />
        {generalMessage ? (
          <Text variant="caption" style={styles.errorMessage}>
            {generalMessage}
          </Text>
        ) : null}
        <Button
          title={mutation.isPending ? 'Entrando…' : 'Ir para a câmera'}
          disabled={mutation.isPending}
          onPress={submit}
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
  errorMessage: {
    color: colors.error,
  },
});
