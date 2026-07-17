/**
 * FILT-03/FILT-04/FILT-05 — filtros na câmera, fluxo ponta-a-ponta (spec etapa-7-filtros).
 * GPU/preview real = UAT (AD-003); aqui o pipeline é mockado e o elo
 * carrossel→seleção→pipeline→upload é testado inteiro (L-002).
 */
import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { renderRouter } from 'expo-router/testing-library';
import * as Haptics from 'expo-haptics';
import * as SecureStore from 'expo-secure-store';

import * as photosApi from '@/api/photos';
import { queryClient } from '@/api/query-client';
import { FILTERS } from '@/camera/filters';

jest.mock('@/camera/filter-pipeline', () => ({
  applyFilterToPhoto: jest.fn(async (uri: string, filter: { key: string }) =>
    filter.key === 'original' ? uri : `file:///processed/${filter.key}.jpg`,
  ),
}));

const { applyFilterToPhoto } = jest.requireMock('@/camera/filter-pipeline') as {
  applyFilterToPhoto: jest.Mock;
};

const { __resetVisionCamera, __getLastCameraProps } = jest.requireMock(
  'react-native-vision-camera',
) as {
  __resetVisionCamera: () => void;
  __getLastCameraProps: () => Record<string, unknown>;
};

const secureStoreMock = SecureStore as unknown as {
  __reset: () => void;
  __seed: (entries: Record<string, string>) => void;
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
        coverImageUrl: null,
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

const selectedOf = (key: string) =>
  screen.getByTestId(`filter-${key}`).props.accessibilityState?.selected;

describe('Filtros na câmera (FILT-03/04/05)', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    applyFilterToPhoto.mockClear();
    (Haptics.impactAsync as jest.Mock).mockClear();
    secureStoreMock.__reset();
    queryClient.clear();
    __resetVisionCamera();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  it('carrossel mostra os 6 filtros com Original ativo por default (FILT-04 AC1)', async () => {
    seedSession();
    fetchMock.mockResolvedValue(eventOk);
    await openCamera();

    for (const key of ['original', 'nupcial', 'ouro', 'sepia', 'pb-classico', 'vintage-94']) {
      expect(screen.getByTestId(`filter-${key}`)).toBeOnTheScreen();
    }
    expect(screen.getByText('P&B Clássico')).toBeOnTheScreen();
    expect(selectedOf('original')).toBe(true);
    expect(selectedOf('sepia')).toBe(false);
  });

  it('tocar num filtro ativa o anel e desativa o anterior (FILT-04 AC2)', async () => {
    seedSession();
    fetchMock.mockResolvedValue(eventOk);
    await openCamera();

    await fireEvent.press(screen.getByTestId('filter-sepia'));

    expect(selectedOf('sepia')).toBe(true);
    expect(selectedOf('original')).toBe(false);
  });

  it('foto com Original: pipeline em bypass, upload recebe a uri da câmera (FILT-05 AC2)', async () => {
    seedSession();
    fetchMock.mockResolvedValueOnce(eventOk).mockResolvedValueOnce(uploadOk(9));
    await openCamera();

    await fireEvent.press(screen.getByTestId('shutter'));
    await waitFor(() => expect(screen.getByTestId('poses-counter')).toHaveTextContent('9 de 10'));

    expect(applyFilterToPhoto).toHaveBeenCalledWith(
      '/mock/DCIM/photo-0001.jpg',
      expect.objectContaining({ key: 'original' }),
    );
  });

  it('foto com Sépia: pipeline processa e o upload recebe a uri filtrada (FILT-05 AC1)', async () => {
    seedSession();
    fetchMock.mockResolvedValueOnce(eventOk).mockResolvedValueOnce(uploadOk(9));
    await openCamera();

    await fireEvent.press(screen.getByTestId('filter-sepia'));
    await fireEvent.press(screen.getByTestId('shutter'));
    await waitFor(() => expect(screen.getByTestId('poses-counter')).toHaveTextContent('9 de 10'));

    expect(applyFilterToPhoto).toHaveBeenCalledWith(
      '/mock/DCIM/photo-0001.jpg',
      expect.objectContaining({ key: 'sepia' }),
    );
    expect(fetchMock.mock.calls[1][0]).toBe('http://test.local:8080/api/photos/upload');
  });

  it('o upload recebe a uri PROCESSADA, não a da câmera (FILT-05 AC1 — fiação)', async () => {
    const spy = jest
      .spyOn(photosApi, 'uploadPhoto')
      .mockResolvedValue({ photoId: 'ph-1', message: 'ok', photosRemaining: 9 });
    seedSession();
    fetchMock.mockResolvedValueOnce(eventOk);
    await openCamera();

    await fireEvent.press(screen.getByTestId('filter-sepia'));
    await fireEvent.press(screen.getByTestId('shutter'));
    await waitFor(() => expect(screen.getByTestId('poses-counter')).toHaveTextContent('9 de 10'));

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ fileUri: 'file:///processed/sepia.jpg' }),
    );
    spy.mockRestore();
  });

  it('preview = véu do filme sobre o preview nativo, SEM frame processor (FILT-03 — fiação)', async () => {
    // O useSkiaFrameProcessor congela o app na new arch (vision-camera#3606/#3517);
    // o preview volta a ser o nativo da Etapa 6 + tint do filtro por cima.
    seedSession();
    fetchMock.mockResolvedValue(eventOk);
    await openCamera();

    expect(__getLastCameraProps().frameProcessor).toBeUndefined();
    expect(screen.queryByTestId('filter-tint')).toBeNull(); // Original: sem véu

    await fireEvent.press(screen.getByTestId('filter-sepia'));

    expect(__getLastCameraProps().frameProcessor).toBeUndefined(); // nunca anexa
    expect(screen.getByTestId('filter-tint')).toHaveStyle({
      backgroundColor: FILTERS.find((f) => f.key === 'sepia')!.previewTint!,
    });

    await fireEvent.press(screen.getByTestId('filter-original'));
    expect(screen.queryByTestId('filter-tint')).toBeNull(); // volta ao preview puro
  });

  it('filtro escolhido persiste entre poses (FILT-04 AC3)', async () => {
    seedSession();
    fetchMock.mockResolvedValueOnce(eventOk).mockResolvedValueOnce(uploadOk(9));
    await openCamera();

    await fireEvent.press(screen.getByTestId('filter-vintage-94'));
    await fireEvent.press(screen.getByTestId('shutter'));
    await waitFor(() => expect(screen.getByTestId('poses-counter')).toHaveTextContent('9 de 10'));

    expect(selectedOf('vintage-94')).toBe(true);
  });

  it('falha no pipeline: pose NÃO é gasta e o obturador volta (FILT-05 AC3)', async () => {
    seedSession({ photosRemaining: 5 });
    fetchMock.mockResolvedValueOnce(eventOk);
    applyFilterToPhoto.mockRejectedValueOnce(new Error('decode falhou'));
    await openCamera();

    await fireEvent.press(screen.getByTestId('filter-ouro'));
    await fireEvent.press(screen.getByTestId('shutter'));

    expect(await screen.findByText('Não foi possível capturar. Tente de novo.')).toBeOnTheScreen();
    expect(screen.getByTestId('poses-counter')).toHaveTextContent('5 de 10');
    expect(fetchMock).toHaveBeenCalledTimes(1); // só o GET do evento — nenhum upload
  });

  it('poses zeradas: carrossel desabilita junto do obturador (FILT-04 AC4)', async () => {
    seedSession({ photosRemaining: 0 });
    fetchMock.mockResolvedValue(eventOk);
    await openCamera();

    expect(
      screen.getByTestId('filter-sepia').props.accessibilityState?.disabled,
    ).toBe(true);

    await fireEvent.press(screen.getByTestId('filter-sepia'));
    expect(selectedOf('original')).toBe(true); // seleção não mudou
  });

  it('haptic leve ao disparar o obturador (DS §7)', async () => {
    seedSession();
    fetchMock.mockResolvedValueOnce(eventOk).mockResolvedValueOnce(uploadOk(9));
    await openCamera();

    await fireEvent.press(screen.getByTestId('shutter'));
    await waitFor(() => expect(Haptics.impactAsync).toHaveBeenCalled());
  });
});
