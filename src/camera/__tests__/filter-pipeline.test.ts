/** FILT-05 — pipeline offscreen da foto filtrada (spec etapa-7-filtros). */
import { Skia } from '@shopify/react-native-skia';

import { applyFilterToPhoto } from '@/camera/filter-pipeline';
import { FILTERS } from '@/camera/filters';

// O jest-expo registra um mock próprio (factory) do expo-file-system que ganha
// do mock manual; o mock deste arquivo tem precedência sobre os dois.
jest.mock('expo-file-system', () => jest.requireActual('../../../__mocks__/expo-file-system'));

const { __getWrittenFiles, __resetWrittenFiles } = jest.requireMock('expo-file-system') as {
  __getWrittenFiles: () => Record<string, Uint8Array>;
  __resetWrittenFiles: () => void;
};

const ORIGINAL = FILTERS[0];
const SEPIA = FILTERS.find((f) => f.key === 'sepia')!;

describe('Pipeline da foto filtrada (FILT-05)', () => {
  beforeEach(() => {
    __resetWrittenFiles();
    jest.clearAllMocks();
  });

  it('Original devolve a uri da câmera sem tocar no Skia (AC2)', async () => {
    const uri = await applyFilterToPhoto('/DCIM/foto.jpg', ORIGINAL);

    expect(uri).toBe('/DCIM/foto.jpg');
    expect(Skia.Data.fromURI).not.toHaveBeenCalled();
    expect(Object.keys(__getWrittenFiles())).toHaveLength(0);
  });

  it('filtro ≠ Original: decodifica, aplica a matriz e grava um JPEG novo (AC1)', async () => {
    const uri = await applyFilterToPhoto('/DCIM/foto.jpg', SEPIA);

    expect(Skia.Data.fromURI).toHaveBeenCalledWith('file:///DCIM/foto.jpg');
    expect(Skia.ColorFilter.MakeMatrix).toHaveBeenCalledWith(SEPIA.matrix);
    // superfície do tamanho da foto original — resolução intacta
    expect(Skia.Surface.MakeOffscreen).toHaveBeenCalledWith(4032, 3024);

    expect(uri).toContain('eterniza-sepia-');
    expect(__getWrittenFiles()[uri]).toBeDefined();
  });

  it('falha de decodificação lança erro claro (pose preservada pelo chamador — AC3)', async () => {
    (Skia.Image.MakeImageFromEncoded as jest.Mock).mockReturnValueOnce(null);

    await expect(applyFilterToPhoto('/DCIM/corrompida.jpg', SEPIA)).rejects.toThrow(
      'Não foi possível ler a foto',
    );
    expect(Object.keys(__getWrittenFiles())).toHaveLength(0);
  });
});
