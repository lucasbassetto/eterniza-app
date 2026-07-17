/**
 * Os 6 filtros de lançamento (DESIGN_SYSTEM §6 — "nomes de filme, não de efeito").
 * Cada filtro é uma matriz de cor 4×5 (row-major, offsets em escala 0–1, alpha
 * intacto) — a MESMA matriz alimenta o preview ao vivo (frame processor), as
 * miniaturas do carrossel e o pipeline da foto final (WYSIWYG).
 *
 * As curvas abaixo são a primeira passada de engenharia; a calibragem fina é
 * feita no UAT olhando o aparelho (DS §6: "a curva exata é trabalho de
 * design/engenharia no Skia — os nomes e a intenção ficam definidos aqui").
 */

export interface CameraFilter {
  key: string;
  /** Nome exibido no carrossel — exatamente como no DS §6. */
  name: string;
  /** Matriz de cor 4×5 (20 elementos). */
  matrix: number[];
  /**
   * "Véu de filme" do visor (rgba): aproximação do tom do filtro sobre o
   * preview nativo. O efeito EXATO aparece nas miniaturas e na foto final —
   * o preview via Skia frame processor congela o app na new arch
   * (vision-camera#3606/#3517, experimental). `null` = sem véu (Original).
   */
  previewTint: string | null;
}

// Pesos de luminância Rec. 709
const LUM_R = 0.2126;
const LUM_G = 0.7152;
const LUM_B = 0.0722;

/** Identidade — nenhum processamento (a foto Original sobe intocada). */
// prettier-ignore
const IDENTITY = [
  1, 0, 0, 0, 0,
  0, 1, 0, 0, 0,
  0, 0, 1, 0, 0,
  0, 0, 0, 1, 0,
];

/** Nupcial — soft/bright: leve lift de brancos, saturação suavizada. */
// prettier-ignore
const NUPCIAL = [
  1.04, 0.05, 0.03, 0, 0.03,
  0.03, 1.05, 0.03, 0, 0.03,
  0.03, 0.05, 1.03, 0, 0.035,
  0,    0,    0,    1, 0,
];

/** Ouro — warm gold: dourado quente, azuis contidos. */
// prettier-ignore
const OURO = [
  1.14, 0.06, 0,    0, 0.01,
  0.04, 1.04, 0,    0, 0.008,
  0,    0.03, 0.86, 0, 0,
  0,    0,    0,    1, 0,
];

/** Sépia — clássica (matriz canônica). */
// prettier-ignore
const SEPIA = [
  0.393, 0.769, 0.189, 0, 0,
  0.349, 0.686, 0.168, 0, 0,
  0.272, 0.534, 0.131, 0, 0,
  0,     0,     0,     1, 0,
];

/** P&B Clássico — saturação zerada por luminância (Rec. 709). */
// prettier-ignore
const PB_CLASSICO = [
  LUM_R, LUM_G, LUM_B, 0, 0,
  LUM_R, LUM_G, LUM_B, 0, 0,
  LUM_R, LUM_G, LUM_B, 0, 0,
  0,     0,     0,     1, 0,
];

/** Vintage 94 — fade: pretos elevados, contraste reduzido, calor sutil (grain: Etapa 8). */
// prettier-ignore
const VINTAGE_94 = [
  0.93, 0.04, 0.02, 0, 0.055,
  0.02, 0.91, 0.02, 0, 0.05,
  0.01, 0.03, 0.80, 0, 0.055,
  0,    0,    0,    1, 0,
];

export const FILTERS: CameraFilter[] = [
  { key: 'original', name: 'Original', matrix: IDENTITY, previewTint: null },
  { key: 'nupcial', name: 'Nupcial', matrix: NUPCIAL, previewTint: 'rgba(255,246,238,0.10)' },
  { key: 'ouro', name: 'Ouro', matrix: OURO, previewTint: 'rgba(255,196,110,0.20)' },
  { key: 'sepia', name: 'Sépia', matrix: SEPIA, previewTint: 'rgba(122,85,48,0.30)' },
  { key: 'pb-classico', name: 'P&B Clássico', matrix: PB_CLASSICO, previewTint: 'rgba(160,160,160,0.35)' },
  { key: 'vintage-94', name: 'Vintage 94', matrix: VINTAGE_94, previewTint: 'rgba(255,220,180,0.18)' },
];

export const DEFAULT_FILTER = FILTERS[0]; // Original

export function isOriginal(filter: CameraFilter): boolean {
  return filter.key === 'original';
}
