/** CAM-03 — upload multipart da foto (spec etapa-6-camera-basica). */
import { ApiError, NetworkError } from '@/api/client';
import { uploadPhoto } from '@/api/photos';

/** FormData de captura: o do jest (Node) não expõe as partes como o do RN. */
class FakeFormData {
  parts: { fieldName: string; value: unknown }[] = [];
  append(fieldName: string, value: unknown) {
    this.parts.push({ fieldName, value });
  }
}

describe('Upload de foto (CAM-03)', () => {
  const fetchMock = jest.fn();
  const realFormData = global.FormData;

  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;
    global.FormData = FakeFormData as unknown as typeof FormData;
  });

  afterAll(() => {
    global.FormData = realFormData;
  });

  it('monta o multipart com file (uri original, sem compressão) + eventId e o Bearer do guest (AC1)', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 201,
      json: () =>
        Promise.resolve({
          success: true,
          message: 'ok',
          data: { photoId: 'ph-1', message: 'ok', photosRemaining: 7 },
        }),
    } as Response);

    const result = await uploadPhoto({
      eventId: 'evt-1',
      token: 'guest-tok-1',
      fileUri: '/DCIM/foto.jpg',
    });

    expect(result.photosRemaining).toBe(7);

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('http://test.local:8080/api/photos/upload');
    expect(init.method).toBe('POST');
    expect(init.headers.Authorization).toBe('Bearer guest-tok-1');
    // multipart: Content-Type fica por conta do fetch (boundary automático)
    expect(init.headers['Content-Type']).toBeUndefined();

    const { parts } = init.body as FakeFormData;
    const file = parts.find((p) => p.fieldName === 'file');
    const eventId = parts.find((p) => p.fieldName === 'eventId');
    expect(file?.value).toMatchObject({
      uri: 'file:///DCIM/foto.jpg',
      name: 'photo.jpg',
      type: 'image/jpeg',
    });
    expect(eventId?.value).toBe('evt-1');
  });

  it('propaga o 400 do backend como ApiError com a mensagem (AC4)', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 400,
      json: () =>
        Promise.resolve({
          success: false,
          message: 'Você já usou todas as suas 10 fotos neste evento',
        }),
    } as Response);

    await expect(
      uploadPhoto({ eventId: 'evt-1', token: 't', fileUri: 'file:///x.jpg' }),
    ).rejects.toMatchObject({ status: 400, message: expect.stringContaining('todas as suas') });
  });

  it('propaga 401 de corpo vazio pelo status (AC5)', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 401,
      json: () => Promise.reject(new SyntaxError('empty')),
    } as Response);

    await expect(
      uploadPhoto({ eventId: 'evt-1', token: 't', fileUri: 'file:///x.jpg' }),
    ).rejects.toBeInstanceOf(ApiError);
  });

  it('falha de rede vira NetworkError distinguível (AC3)', async () => {
    fetchMock.mockRejectedValue(new TypeError('Network request failed'));

    await expect(
      uploadPhoto({ eventId: 'evt-1', token: 't', fileUri: 'file:///x.jpg' }),
    ).rejects.toBeInstanceOf(NetworkError);
  });
});
