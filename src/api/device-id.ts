import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

const DEVICE_ID_KEY = 'eterniza.guest.deviceId';

let inflight: Promise<string> | null = null;

/**
 * UUID estável do dispositivo — identifica o convidado para o limite de poses
 * (regra 1 do brief). Gerado UMA vez por instalação e persistido; NUNCA regenerar
 * (regenerar faria o convidado "virar outra pessoa" e perder o histórico).
 * Single-flight: chamadas concorrentes compartilham a mesma geração.
 */
export function getDeviceId(): Promise<string> {
  if (!inflight) {
    inflight = loadOrCreate();
    // Falhou (secure store indisponível): libera para a próxima tentativa
    inflight.catch(() => {
      inflight = null;
    });
  }
  return inflight;
}

async function loadOrCreate(): Promise<string> {
  const existing = await SecureStore.getItemAsync(DEVICE_ID_KEY);
  if (existing) return existing;

  const id = Crypto.randomUUID();
  await SecureStore.setItemAsync(DEVICE_ID_KEY, id);
  return id;
}

/** Somente para testes: limpa a memoização entre casos. */
export function __resetDeviceIdCache(): void {
  inflight = null;
}
