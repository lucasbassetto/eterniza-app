import { ApiError } from './client';

/**
 * Estado do obturador derivado das poses restantes (DS §6):
 * - ready: anel branco fino
 * - lastPose: anel `accent` — o único momento cromático da câmera
 * - busy: upload em andamento, desabilitado
 * - exhausted: poses zeradas, desabilitado (anel `editorial-border`) + mensagem serena
 */
export type ShutterState = 'ready' | 'lastPose' | 'busy' | 'exhausted';

export function shutterStateFor(remaining: number, busy: boolean): ShutterState {
  if (remaining <= 0) return 'exhausted';
  if (busy) return 'busy';
  if (remaining === 1) return 'lastPose';
  return 'ready';
}

/**
 * 400 de limite do upload ("Você já usou todas as suas N fotos neste evento").
 * Distinto dos demais 400 (arquivo vazio/formato/20MB) — zera o contador local.
 */
export function isLimitError(error: unknown): boolean {
  return error instanceof ApiError && error.status === 400 && /já usou todas/i.test(error.message);
}
