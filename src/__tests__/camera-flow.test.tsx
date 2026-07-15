/**
 * CAM-02/CAM-04 — Câmera do convidado, fluxo ponta-a-ponta (spec etapa-6-camera-basica).
 * VisionCamera mockada (captura real = UAT, AD-003); fetch e secure store mockados.
 * Elo câmera→upload→contador→obturador testado inteiro (L-002).
 */
import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { renderRouter } from 'expo-router/testing-library';
import * as SecureStore from 'expo-secure-store';
import { Linking } from 'react-native';
import { useCameraDevice, useCameraPermission } from 'react-native-vision-camera';

import { queryClient } from '@/api/query-client';

// Helper do mock (não existe nos tipos reais do módulo)
const { __resetVisionCamera } = jest.requireMock('react-native-vision-camera') as {
  __resetVisionCamera: () => void;
};

const secureStoreMock = SecureStore as unknown as {
  __reset: () => void;
  __seed: (entries: Record<string, string>) => void;
  __get: (key: string) => string | undefined;
};

const SESSION_KEY = 'eterniza.guest.session.evt-1';

const eventOk = {
  ok: true,
  status: 200,
  json: () =>
    Promise.resolve({
      success: true,
      message: 'ok',
      data: {
        id: 'evt-1',
        name: 'Casamento Ana & João',
        slug: 'ana-e-joao',
        qrCodeUrl: 'https://eterniza.app/e/ana-e-joao',
        status: 'ACTIVE',
        revealAt: '2026-08-01T20:00:00Z',
        photoLimitPerGuest: 10,
        photoCount: 3,
        createdAt: '2026-07-01T12:00:00Z',
      },
    }),
} as Response;

const uploadOk = (photosRemaining: number) =>
  ({
    ok: true,
    status: 201,
    json: () =>
      Promise.resolve({
        success: true,
        message: 'ok',
        data: { photoId: 'ph-1', message: 'ok', photosRemaining },
      }),
  }) as Response;

function seedSession(extra: Record<string, unknown> = {}) {
  secureStoreMock.__seed({
    [SESSION_KEY]: JSON.stringify({ token: 'guest-tok-1', displayName: 'Lia', ...extra }),
  });
}

async function openCamera() {
  const view = renderRouter('./src/app', { initialUrl: '/e/ana-e-joao/camera' });
  await view;
  await screen.findByTestId('poses-counter');
  return { view };
}

describe('Câmera do convidado (CAM-02/CAM-04)', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    secureStoreMock.__reset();
    queryClient.clear();
    __resetVisionCamera();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  it('sem sessão do evento: redireciona ao convite (guarda)', async () => {
    fetchMock.mockResolvedValue(eventOk);
    const view = renderRouter('./src/app', { initialUrl: '/e/ana-e-joao/camera' });
    await view;

    expect(await screen.findByText('Você foi convidado para')).toBeOnTheScreen();
    expect(view.getPathname()).toBe('/e/ana-e-joao');
  });

  it('sessão nova: contador parte do limite do evento — "10 de 10" (CAM-04 AC1)', async () => {
    seedSession();
    fetchMock.mockResolvedValue(eventOk);
    await openCamera();

    expect(screen.getByTestId('poses-counter')).toHaveTextContent('10 de 10');
    expect(screen.getByText('Casamento Ana & João'.toUpperCase(), { exact: false })).toBeTruthy();
  });

  it('photosRemaining persistido: contador continua de onde parou (CAM-04 AC5)', async () => {
    seedSession({ photosRemaining: 3 });
    fetchMock.mockResolvedValue(eventOk);
    await openCamera();

    expect(screen.getByTestId('poses-counter')).toHaveTextContent('3 de 10');
  });

  it('tirar foto: upload multipart com o guestToken, contador atualiza e persiste (CAM-02 AC3, CAM-03 AC1/AC2)', async () => {
    seedSession();
    fetchMock.mockResolvedValueOnce(eventOk).mockResolvedValueOnce(uploadOk(9));
    await openCamera();

    await fireEvent.press(screen.getByTestId('shutter'));

    await waitFor(() => expect(screen.getByTestId('poses-counter')).toHaveTextContent('9 de 10'));

    const [url, init] = fetchMock.mock.calls[1];
    expect(url).toBe('http://test.local:8080/api/photos/upload');
    expect(init.headers.Authorization).toBe('Bearer guest-tok-1');

    const saved = JSON.parse(secureStoreMock.__get(SESSION_KEY)!);
    expect(saved.photosRemaining).toBe(9);
  });

  it('falha de rede: pose NÃO é gasta, erro discreto, obturador volta a funcionar (CAM-03 AC3)', async () => {
    seedSession({ photosRemaining: 5 });
    fetchMock
      .mockResolvedValueOnce(eventOk)
      .mockRejectedValueOnce(new TypeError('Network request failed'))
      .mockResolvedValueOnce(uploadOk(4));
    await openCamera();

    await fireEvent.press(screen.getByTestId('shutter'));
    expect(
      await screen.findByText('A foto não subiu — verifique a conexão e tente de novo.'),
    ).toBeOnTheScreen();
    expect(screen.getByTestId('poses-counter')).toHaveTextContent('5 de 10'); // pose preservada

    // segunda tentativa funciona
    await fireEvent.press(screen.getByTestId('shutter'));
    await waitFor(() => expect(screen.getByTestId('poses-counter')).toHaveTextContent('4 de 10'));
  });

  it('400 de limite: contador zera, mensagem serena, obturador desabilita (CAM-03 AC4, CAM-04 AC3)', async () => {
    seedSession({ photosRemaining: 2 }); // local acha que tem 2, servidor sabe que acabou
    fetchMock.mockResolvedValueOnce(eventOk).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: () =>
        Promise.resolve({
          success: false,
          message: 'Você já usou todas as suas 10 fotos neste evento',
        }),
    } as Response);
    await openCamera();

    await fireEvent.press(screen.getByTestId('shutter'));

    expect(
      await screen.findByText('Suas fotos estão guardadas até a revelação ✨'),
    ).toBeOnTheScreen();
    expect(screen.getByTestId('poses-counter')).toHaveTextContent('0 de 10');

    // obturador morto: nenhum novo upload
    const calls = fetchMock.mock.calls.length;
    await fireEvent.press(screen.getByTestId('shutter'));
    expect(fetchMock.mock.calls.length).toBe(calls);
  });

  it('última pose: anel do obturador vira accent (CAM-04 AC2)', async () => {
    seedSession({ photosRemaining: 1 });
    fetchMock.mockResolvedValue(eventOk);
    await openCamera();

    expect(screen.getByTestId('shutter')).toHaveStyle({ borderColor: '#136F99' });
  });

  it('poses zeradas desde a entrada: obturador desabilitado ANTES de qualquer request (CAM-04 AC3)', async () => {
    seedSession({ photosRemaining: 0 });
    fetchMock.mockResolvedValue(eventOk);
    await openCamera();

    expect(screen.getByText('Suas fotos estão guardadas até a revelação ✨')).toBeOnTheScreen();

    await fireEvent.press(screen.getByTestId('shutter'));
    expect(fetchMock.mock.calls.length).toBe(1); // só o GET do evento — zero uploads
  });

  it('permissão negada: explica e oferece Abrir ajustes, sem crash (CAM-02 AC1)', async () => {
    seedSession();
    fetchMock.mockResolvedValue(eventOk);
    (useCameraPermission as jest.Mock).mockReturnValue({
      hasPermission: false,
      requestPermission: jest.fn(async () => false),
    });
    const openSettings = jest.spyOn(Linking, 'openSettings').mockResolvedValue();

    const view = renderRouter('./src/app', { initialUrl: '/e/ana-e-joao/camera' });
    await view;

    expect(await screen.findByText('A câmera é a festa')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Abrir ajustes' }));
    expect(openSettings).toHaveBeenCalled();
  });

  it('sem câmera disponível (simulador): degrada com mensagem, sem crash (edge case)', async () => {
    seedSession();
    fetchMock.mockResolvedValue(eventOk);
    (useCameraDevice as jest.Mock).mockReturnValue(undefined);

    const view = renderRouter('./src/app', { initialUrl: '/e/ana-e-joao/camera' });
    await view;

    expect(
      await screen.findByText('Nenhuma câmera disponível neste dispositivo.'),
    ).toBeOnTheScreen();
  });
});
