/** FILT-02 — os 6 filtros como matrizes de cor (spec etapa-7-filtros). */
import { DEFAULT_FILTER, FILTERS, isOriginal } from '@/camera/filters';

describe('Filtros de lançamento (FILT-02)', () => {
  it('são exatamente os 6 do DS §6, na ordem definida (AC1)', () => {
    expect(FILTERS.map((f) => f.name)).toEqual([
      'Original',
      'Nupcial',
      'Ouro',
      'Sépia',
      'P&B Clássico',
      'Vintage 94',
    ]);
  });

  it('Original é a matriz identidade — nenhuma alteração (AC2)', () => {
    // prettier-ignore
    expect(FILTERS[0].matrix).toEqual([
      1, 0, 0, 0, 0,
      0, 1, 0, 0, 0,
      0, 0, 1, 0, 0,
      0, 0, 0, 1, 0,
    ]);
    expect(isOriginal(FILTERS[0])).toBe(true);
    expect(DEFAULT_FILTER).toBe(FILTERS[0]);
  });

  it('P&B Clássico zera a saturação: linhas RGB iguais com pesos de luminância (AC3)', () => {
    const pb = FILTERS.find((f) => f.key === 'pb-classico')!;
    const [r, g, b] = [pb.matrix.slice(0, 5), pb.matrix.slice(5, 10), pb.matrix.slice(10, 15)];

    expect(r).toEqual(g);
    expect(g).toEqual(b);
    // pesos somam ~1 (luminância preservada) e não há offset
    expect(r[0] + r[1] + r[2]).toBeCloseTo(1, 2);
    expect(r[4]).toBe(0);
  });

  it('toda matriz tem 20 elementos (4×5) com a linha do alpha intacta (AC4)', () => {
    for (const filter of FILTERS) {
      expect(filter.matrix).toHaveLength(20);
      expect(filter.matrix.slice(15)).toEqual([0, 0, 0, 1, 0]);
    }
  });

  it('só o Original é identidade — os demais alteram a imagem', () => {
    const identity = FILTERS[0].matrix;
    for (const filter of FILTERS.slice(1)) {
      expect(filter.matrix).not.toEqual(identity);
      expect(isOriginal(filter)).toBe(false);
    }
  });

  it('Vintage 94 tem os pretos elevados (fade: offsets positivos)', () => {
    const vintage = FILTERS.find((f) => f.key === 'vintage-94')!;
    expect(vintage.matrix[4]).toBeGreaterThan(0);
    expect(vintage.matrix[9]).toBeGreaterThan(0);
    expect(vintage.matrix[14]).toBeGreaterThan(0);
  });

  it('chaves únicas (identificador estável para seleção/telemetria)', () => {
    const keys = FILTERS.map((f) => f.key);
    expect(new Set(keys).size).toBe(keys.length);
  });
});
