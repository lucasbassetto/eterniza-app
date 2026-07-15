/** GUEST-02 — deviceId persistente (spec etapa-5-fluxo-convidado). */
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

import { getDeviceId, __resetDeviceIdCache } from '@/api/device-id';

const secureStoreMock = SecureStore as unknown as {
  __reset: () => void;
  __seed: (entries: Record<string, string>) => void;
  __get: (key: string) => string | undefined;
};

const cryptoMock = Crypto as unknown as {
  randomUUID: jest.Mock;
  __resetRandomUUID: () => void;
};

const KEY = 'eterniza.guest.deviceId';

describe('deviceId persistente (GUEST-02)', () => {
  beforeEach(() => {
    secureStoreMock.__reset();
    cryptoMock.__resetRandomUUID();
    __resetDeviceIdCache();
    (SecureStore.setItemAsync as jest.Mock).mockClear();
  });

  it('sem deviceId salvo: gera um UUID e persiste antes de devolver (AC1)', async () => {
    const id = await getDeviceId();

    expect(id).toBe('uuid-teste-1');
    expect(secureStoreMock.__get(KEY)).toBe('uuid-teste-1');
  });

  it('com deviceId salvo: reutiliza o mesmo valor, sem gerar novo (AC2)', async () => {
    secureStoreMock.__seed({ [KEY]: 'uuid-antigo' });

    const id = await getDeviceId();

    expect(id).toBe('uuid-antigo');
    expect(cryptoMock.randomUUID).not.toHaveBeenCalled();
    expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
  });

  it('chamadas repetidas devolvem sempre o mesmo valor (AC2 — nunca regenerar)', async () => {
    const primeiro = await getDeviceId();
    const segundo = await getDeviceId();

    expect(segundo).toBe(primeiro);
    expect(cryptoMock.randomUUID).toHaveBeenCalledTimes(1);
  });

  it('chamadas concorrentes compartilham a geração — um único UUID gravado (edge case)', async () => {
    const [a, b] = await Promise.all([getDeviceId(), getDeviceId()]);

    expect(a).toBe(b);
    expect(cryptoMock.randomUUID).toHaveBeenCalledTimes(1);
    expect(SecureStore.setItemAsync).toHaveBeenCalledTimes(1);
  });

  it('falha do secure store não envenena o cache: próxima chamada tenta de novo', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockRejectedValueOnce(new Error('keychain fora'));

    await expect(getDeviceId()).rejects.toThrow('keychain fora');

    const id = await getDeviceId();
    expect(id).toBe('uuid-teste-1');
    expect(secureStoreMock.__get(KEY)).toBe('uuid-teste-1');
  });
});
