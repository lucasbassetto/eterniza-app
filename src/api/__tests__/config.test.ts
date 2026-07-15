/**
 * API-01 edge case — .env sem EXPO_PUBLIC_API_URL falha com mensagem clara.
 */
import { getBaseUrl } from '../config';

describe('getBaseUrl (API-01)', () => {
  const original = process.env.EXPO_PUBLIC_API_URL;

  afterEach(() => {
    process.env.EXPO_PUBLIC_API_URL = original;
  });

  it('retorna a URL do env sem barra final (AC5)', () => {
    process.env.EXPO_PUBLIC_API_URL = 'http://test.local:8080/';
    expect(getBaseUrl()).toBe('http://test.local:8080');
  });

  it('sem env definida: falha com mensagem clara, não URL silenciosamente errada (edge case)', () => {
    delete process.env.EXPO_PUBLIC_API_URL;
    expect(() => getBaseUrl()).toThrow('EXPO_PUBLIC_API_URL não definida');
  });
});
