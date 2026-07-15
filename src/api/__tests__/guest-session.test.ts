/** GUEST-03 — armazenamento da sessão do convidado por evento. */
import * as SecureStore from 'expo-secure-store';

import { getGuestSession, saveGuestSession } from '@/api/guest-session';

const secureStoreMock = SecureStore as unknown as {
  __reset: () => void;
  __seed: (entries: Record<string, string>) => void;
  __get: (key: string) => string | undefined;
};

describe('Sessão do convidado por evento (GUEST-03)', () => {
  beforeEach(() => {
    secureStoreMock.__reset();
  });

  it('salva e recupera a sessão isolada por evento', async () => {
    await saveGuestSession('evt-1', { token: 'tok-1', displayName: 'Lia' });
    await saveGuestSession('evt-2', { token: 'tok-2', displayName: 'Bia' });

    expect(await getGuestSession('evt-1')).toEqual({ token: 'tok-1', displayName: 'Lia' });
    expect(await getGuestSession('evt-2')).toEqual({ token: 'tok-2', displayName: 'Bia' });
  });

  it('sem sessão salva devolve null', async () => {
    expect(await getGuestSession('evt-sem-sessao')).toBeNull();
  });

  it('valor corrompido no storage devolve null em vez de crashar (edge case)', async () => {
    secureStoreMock.__seed({ 'eterniza.guest.session.evt-1': 'não é json {' });

    expect(await getGuestSession('evt-1')).toBeNull();
  });
});
