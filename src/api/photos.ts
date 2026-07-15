import { request } from './client';

/** Resposta do `POST /api/photos/upload` (APP_BRIEF §3). */
export interface UploadResult {
  photoId: string;
  message: string;
  photosRemaining: number;
}

/**
 * Sobe a foto original — SEM comprimir/redimensionar (regra 4 do brief: o que
 * subir degradado fica degradado para sempre). Multipart: `file` + `eventId`,
 * autenticado com o guestToken do evento.
 */
export async function uploadPhoto(params: {
  eventId: string;
  token: string;
  fileUri: string;
}): Promise<UploadResult> {
  const uri = params.fileUri.startsWith('file://') ? params.fileUri : `file://${params.fileUri}`;

  const form = new FormData();
  // RN aceita descritor {uri, name, type} como parte de arquivo do multipart
  form.append('file', { uri, name: 'photo.jpg', type: 'image/jpeg' } as unknown as Blob);
  form.append('eventId', params.eventId);

  return request<UploadResult>('/api/photos/upload', {
    method: 'POST',
    body: form,
    token: params.token,
  });
}
