/** CAM-04 — estado do obturador e detecção do 400 de limite (spec etapa-6-camera-basica). */
import { ApiError, NetworkError } from '@/api/client';
import { isLimitError, shutterStateFor } from '@/api/poses';

describe('Estado do obturador (CAM-04)', () => {
  it('poses sobrando e sem upload: pronto (anel branco)', () => {
    expect(shutterStateFor(10, false)).toBe('ready');
    expect(shutterStateFor(2, false)).toBe('ready');
  });

  it('exatamente 1 pose: lastPose (anel accent — AC2)', () => {
    expect(shutterStateFor(1, false)).toBe('lastPose');
  });

  it('upload em andamento: busy, mesmo com poses sobrando (AC4)', () => {
    expect(shutterStateFor(5, true)).toBe('busy');
    expect(shutterStateFor(1, true)).toBe('busy');
  });

  it('zero poses: exhausted, independente de upload (AC3)', () => {
    expect(shutterStateFor(0, false)).toBe('exhausted');
    expect(shutterStateFor(0, true)).toBe('exhausted');
    expect(shutterStateFor(-1, false)).toBe('exhausted');
  });
});

describe('Detecção do 400 de limite (CAM-03 AC4)', () => {
  it('reconhece a mensagem de limite do backend', () => {
    expect(
      isLimitError(new ApiError(400, 'Você já usou todas as suas 10 fotos neste evento')),
    ).toBe(true);
  });

  it('não confunde outros 400 (formato/tamanho) com limite', () => {
    expect(isLimitError(new ApiError(400, 'Formato de arquivo inválido'))).toBe(false);
  });

  it('não confunde outros erros', () => {
    expect(isLimitError(new ApiError(404, 'Evento não encontrado'))).toBe(false);
    expect(isLimitError(new NetworkError())).toBe(false);
    expect(isLimitError(new Error('já usou todas'))).toBe(false);
  });
});
