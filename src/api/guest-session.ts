import * as SecureStore from 'expo-secure-store';

/** Sessão de convidado de UM evento (guestToken, 7 dias). */
export interface GuestSession {
  token: string;
  displayName: string;
  /** Último valor conhecido vindo do upload (fonte da verdade = servidor). Ausente = sessão nova. */
  photosRemaining?: number;
}

// Chave por evento: o mesmo dispositivo pode visitar vários casamentos,
// e a sessão de um não pode sobrescrever a de outro.
const keyFor = (eventId: string) => `eterniza.guest.session.${eventId}`;

export async function saveGuestSession(eventId: string, session: GuestSession): Promise<void> {
  await SecureStore.setItemAsync(keyFor(eventId), JSON.stringify(session));
}

/** Persiste as poses restantes junto da sessão (sobrevive a reaberturas — CAM-04 AC5). */
export async function updatePhotosRemaining(
  eventId: string,
  photosRemaining: number,
): Promise<void> {
  const session = await getGuestSession(eventId);
  if (!session) return;
  await saveGuestSession(eventId, { ...session, photosRemaining });
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
