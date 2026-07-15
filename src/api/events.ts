import { request } from './client';

/** EventResponse da API (APP_BRIEF §3). */
export interface EventResponse {
  id: string;
  name: string;
  slug: string;
  qrCodeUrl: string;
  status: 'ACTIVE' | 'REVEALED';
  revealAt: string;
  photoLimitPerGuest: number;
  photoCount: number;
  /** Capa do convite (foto dos noivos). `null` = fundo padrão editorial (brief §3). */
  coverImageUrl: string | null;
  createdAt: string;
}

/** `GET /api/events/slug/{slug}` — o que o app chama ao abrir o link do QR. Rota pública. */
export async function getEventBySlug(slug: string): Promise<EventResponse> {
  return request<EventResponse>(`/api/events/slug/${slug}`);
}
