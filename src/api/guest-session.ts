import * as SecureStore from 'expo-secure-store';

/** Sessão de convidado de UM evento (guestToken, 7 dias). */
export interface GuestSession {
  token: string;
  displayName: string;
}

// Chave por evento: o mesmo dispositivo pode visitar vários casamentos,
// e a sessão de um não pode sobrescrever a de outro.
const keyFor = (eventId: string) => `eterniza.guest.session.${eventId}`;

export async function saveGuestSession(eventId: string, session: GuestSession): Promise<void> {
  await SecureStore.setItemAsync(keyFor(eventId), JSON.stringify(session));
}

export async function getGuestSession(eventId: string): Promise<GuestSession | null> {
  const raw = await SecureStore.getItemAsync(keyFor(eventId));
  if (!raw) return null;
  try {
    const session = JSON.parse(raw) as GuestSession;
    return session.token && session.displayName ? session : null;
  } catch {
    return null; // valor corrompido = sem sessão; o convidado entra de novo
  }
}
