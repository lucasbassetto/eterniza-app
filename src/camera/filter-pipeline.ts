import { ImageFormat, Skia } from '@shopify/react-native-skia';
import { File, Paths } from 'expo-file-system';

import { isOriginal, type CameraFilter } from './filters';

// Re-encode inerente ao filtro client-side (brief §4 regra 3); resolução intacta.
const JPEG_QUALITY = 92;

/**
 * Aplica a MESMA matriz do preview na foto capturada, offscreen, em resolução
 * máxima (FILT-05). `Original` devolve o arquivo da câmera sem reprocessar.
 * Falhas lançam — o chamador preserva a pose (contrato da CAM-03 AC3).
 */
export async function applyFilterToPhoto(
  fileUri: string,
  filter: CameraFilter,
): Promise<string> {
  if (isOriginal(filter)) return fileUri;

  const uri = fileUri.startsWith('file://') ? fileUri : `file://${fileUri}`;

  const data = await Skia.Data.fromURI(uri);
  const source = Skia.Image.MakeImageFromEncoded(data);
  if (!source) throw new Error('Não foi possível ler a foto para aplicar o filtro.');

  const surface = Skia.Surface.MakeOffscreen(source.width(), source.height());
  if (!surface) throw new Error('Não foi possível preparar a superfície do filtro.');

  const paint = Skia.Paint();
  paint.setColorFilter(Skia.ColorFilter.MakeMatrix(filter.matrix));
  surface.getCanvas().drawImage(source, 0, 0, paint);

  const bytes = surface.makeImageSnapshot().encodeToBytes(ImageFormat.JPEG, JPEG_QUALITY);
  if (!bytes) throw new Error('Não foi possível codificar a foto filtrada.');

  const output = new File(Paths.cache, `eterniza-${filter.key}-${Date.now()}.jpg`);
  output.write(bytes);
  return output.uri;
}
