import { request } from './client';
import { getDeviceId } from './device-id';
import { saveGuestSession } from './guest-session';

/**
 * `POST /api/auth/guest/session` → guestToken (7 dias; `data` é o token, string).
 * Usa o `id` do EventResponse, nunca o slug (regra 8 do brief) — a sessão não
 * valida o evento; quem valida é o `GET /events/slug/{slug}` que veio antes.
 */
export async function createGuestSession(eventId: string, displayName: string): Promise<string> {
  const deviceId = await getDeviceId();
  const token = await request<string>('/api/auth/guest/session', {
    method: 'POST',
    body: { displayName, eventId, deviceId },
  });
  await saveGuestSession(eventId, { token, displayName });
  return token;
}
