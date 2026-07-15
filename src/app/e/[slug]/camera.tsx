import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Redirect, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Camera,
  useCameraDevice,
  useCameraFormat,
  useCameraPermission,
} from 'react-native-vision-camera';

import { ApiError, NetworkError } from '@/api/client';
import { getEventBySlug } from '@/api/events';
import { getGuestSession, updatePhotosRemaining, type GuestSession } from '@/api/guest-session';
import { uploadPhoto } from '@/api/photos';
import { isLimitError, shutterStateFor } from '@/api/poses';
import { Button } from '@/components/button';
import { Text } from '@/components/text';
import { colors, radius, spacing } from '@/theme/theme';

/** Câmera do convidado (DS §6; ref. AD-007 landing_2/3). Sem filtros (Etapa 7) nem tira de filme (Etapa 8). */
export default function GuestCamera() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const queryClient = useQueryClient();
  const cameraRef = useRef<Camera>(null);
  const [position, setPosition] = useState<'back' | 'front'>('back');
  const [remaining, setRemaining] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const { hasPermission, requestPermission } = useCameraPermission();
  const [permissionResolved, setPermissionResolved] = useState(hasPermission);
  useEffect(() => {
    if (hasPermission) {
      setPermissionResolved(true);
      return;
    }
    requestPermission().finally(() => setPermissionResolved(true));
    // requestPermission é estável; re-rodar só se a permissão mudar nos ajustes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasPermission]);

  const device = useCameraDevice(position);
  // Foto na resolução máxima (regra 4 do brief) E vídeo máximo/30fps: o preview
  // usa o stream de vídeo do formato — otimizar só a foto deixa o preview borrado
  const format = useCameraFormat(device, [
    { photoResolution: 'max' },
    { videoResolution: 'max' },
    { fps: 30 },
  ]);

  const eventQuery = useQuery({
    queryKey: ['event', slug],
    queryFn: () => getEventBySlug(slug),
    retry: false,
  });
  const event = eventQuery.data;

  const sessionQuery = useQuery({
    queryKey: ['guest-session', event?.id],
    queryFn: () => getGuestSession(event!.id),
    enabled: !!event,
  });
  const session = sessionQuery.data;

  // Contador: último photosRemaining persistido, ou limite do evento em sessão nova
  useEffect(() => {
    if (event && session && remaining === null) {
      setRemaining(session.photosRemaining ?? event.photoLimitPerGuest);
    }
  }, [event, session, remaining]);

  // Contador local + secure store + cache da query andam juntos (fonte = servidor)
  const applyRemaining = async (value: number) => {
    setRemaining(value);
    await updatePhotosRemaining(event!.id, value);
    queryClient.setQueryData(
      ['guest-session', event!.id],
      (old: GuestSession | null | undefined) =>
        old ? { ...old, photosRemaining: value } : old,
    );
  };

  const upload = useMutation({
    mutationFn: (fileUri: string) =>
      uploadPhoto({ eventId: event!.id, token: session!.token, fileUri }),
    onSuccess: async (result) => {
      setUploadError(null);
      await applyRemaining(result.photosRemaining);
    },
    onError: async (error) => {
      if (isLimitError(error)) {
        await applyRemaining(0);
        return;
      }
      // Pose NÃO é gasta: o servidor só conta o que recebeu
      setUploadError(
        error instanceof NetworkError
          ? 'A foto não subiu — verifique a conexão e tente de novo.'
          : error instanceof ApiError && error.status === 401
            ? 'Sua sessão expirou. Abra o link do convite de novo.'
            : error instanceof Error
              ? error.message
              : 'Algo deu errado no envio.',
      );
    },
  });

  const takePhoto = async () => {
    if (!cameraRef.current) return;
    setUploadError(null);
    try {
      const photo = await cameraRef.current.takePhoto();
      upload.mutate(photo.path);
    } catch {
      setUploadError('Não foi possível capturar. Tente de novo.');
    }
  };

  // ─── Estados de borda ────────────────────────────────────────────────
  if (eventQuery.isPending || (event && sessionQuery.isPending)) {
    return <Shell />;
  }

  if (eventQuery.isError) {
    return (
      <Shell>
        <View style={styles.center}>
          <Text style={styles.mutedText}>Não foi possível carregar o evento.</Text>
        </View>
      </Shell>
    );
  }

  // Sem sessão: volta ao convite para entrar (o convite redireciona de volta se já houver)
  if (!session) {
    return <Redirect href={{ pathname: '/e/[slug]', params: { slug } }} />;
  }

  if (permissionResolved && !hasPermission) {
    return (
      <Shell>
        <View style={styles.center}>
          <Text variant="title" onDark>
            A câmera é a festa
          </Text>
          <Text style={styles.mutedText}>
            Sem acesso à câmera não dá para fotografar o evento. Permita o acesso nos ajustes do
            iPhone.
          </Text>
          <Button title="Abrir ajustes" onDark onPress={() => Linking.openSettings()} />
        </View>
      </Shell>
    );
  }

  if (!device) {
    return (
      <Shell>
        <View style={styles.center}>
          <Text style={styles.mutedText}>Nenhuma câmera disponível neste dispositivo.</Text>
        </View>
      </Shell>
    );
  }

  // ─── Câmera ──────────────────────────────────────────────────────────
  const limit = event!.photoLimitPerGuest;
  const shutter = shutterStateFor(remaining ?? limit, upload.isPending);

  const ringColor = {
    ready: colors.editorialText,
    lastPose: colors.accent,
    busy: colors.editorialBorder,
    exhausted: colors.editorialBorder,
  }[shutter];

  return (
    <Shell>
      {hasPermission ? (
        <Camera
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          device={device}
          format={format}
          photoQualityBalance="quality"
          isActive
          photo
        />
      ) : null}

      <SafeAreaView style={styles.overlay} pointerEvents="box-none">
        <View style={styles.top}>
          <Text variant="caption" style={styles.eventName}>
            {event!.name}
          </Text>
          <Text variant="caption" style={styles.counter} testID="poses-counter">
            {remaining ?? limit} de {limit}
          </Text>
        </View>

        <View style={styles.bottom}>
          {shutter === 'exhausted' ? (
            <Text style={styles.exhaustedMessage}>
              Suas fotos estão guardadas até a revelação ✨
            </Text>
          ) : null}
          {uploadError ? (
            <Text variant="caption" style={styles.uploadError}>
              {uploadError}
            </Text>
          ) : null}

          <View style={styles.controls}>
            <View style={styles.controlSide} />
            <Pressable
              testID="shutter"
              accessibilityRole="button"
              accessibilityLabel="Tirar foto"
              disabled={shutter === 'exhausted' || shutter === 'busy'}
              onPress={takePhoto}
              style={[styles.shutterRing, { borderColor: ringColor }]}
            >
              <View
                style={[
                  styles.shutterCenter,
                  (shutter === 'exhausted' || shutter === 'busy') && styles.shutterCenterDisabled,
                ]}
              />
            </Pressable>
            <View style={styles.controlSide}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Virar câmera"
                onPress={() => setPosition((p) => (p === 'back' ? 'front' : 'back'))}
                hitSlop={spacing.md}
              >
                <Text variant="caption" style={styles.flip}>
                  Virar
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </Shell>
  );
}

/** Shell editorial full-bleed (sem o gutter do <Screen> — o preview domina, a UI recua). */
function Shell({ children }: { children?: ReactNode }) {
  return <View style={styles.shell}>{children}</View>;
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: colors.editorial,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    gap: spacing.lg,
  },
  mutedText: {
    color: colors.editorialTextMuted,
  },
  top: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingTop: spacing.md,
  },
  eventName: {
    color: colors.editorialText,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  counter: {
    // números em Archivo tabular (DS §6)
    fontFamily: 'Archivo_400Regular',
    fontVariant: ['tabular-nums'],
    color: colors.editorialText,
    fontSize: 14,
    lineHeight: 18,
  },
  bottom: {
    alignItems: 'center',
    gap: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  exhaustedMessage: {
    color: colors.editorialText,
    textAlign: 'center',
    paddingHorizontal: spacing.xxl,
  },
  uploadError: {
    color: colors.editorialText,
    backgroundColor: colors.overlay,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    textAlign: 'center',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    paddingHorizontal: spacing.xxl,
  },
  controlSide: {
    flex: 1,
    alignItems: 'center',
  },
  // Obturador: círculo 76px, anel fino, centro canvas (DS §6)
  shutterRing: {
    width: 76,
    height: 76,
    borderRadius: radius.circle,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterCenter: {
    width: 62,
    height: 62,
    borderRadius: radius.circle,
    backgroundColor: colors.canvas,
  },
  shutterCenterDisabled: {
    backgroundColor: colors.editorialBorder,
  },
  flip: {
    color: colors.editorialText,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
