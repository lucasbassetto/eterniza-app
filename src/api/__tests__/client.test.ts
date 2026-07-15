/**
 * API-01 — Cliente da API com envelope (spec etapa-4-api-auth).
 * Formatos de resposta transcritos do APP_BRIEF §3.
 */
import { ApiError, NetworkError, request } from '../client';

const jsonResponse = (status: number, body: unknown) =>
  ({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  }) as Response;

const emptyBodyResponse = (status: number) =>
  ({
    ok: false,
    status,
    json: () => Promise.reject(new SyntaxError('Unexpected end of JSON input')),
  }) as Response;

describe('request (API-01)', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  it('2xx: retorna o data do envelope (AC1)', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(200, {
        success: true,
        message: 'ok',
        data: { id: 'uuid-1', name: 'Casamento Ana & João' },
        timestamp: '2026-07-14T00:00:00Z',
      }),
    );

    await expect(request('/api/events/slug/x')).resolves.toEqual({
      id: 'uuid-1',
      name: 'Casamento Ana & João',
    });
  });

  it('400 com errors: ApiError expõe message e o mapa campo→mensagem (AC2)', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(400, {
        success: false,
        message: 'Erro de validação',
        errors: { name: 'Nome do evento é obrigatório' },
      }),
    );

    const error = (await request('/api/events', { method: 'POST', body: {} }).catch((e) => e)) as ApiError;
    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(400);
    expect(error.message).toBe('Erro de validação');
    expect(error.errors).toEqual({ name: 'Nome do evento é obrigatório' });
  });

  it('401 corpo vazio: tratado pelo status, sem tentar parse (AC3)', async () => {
    const response = emptyBodyResponse(401);
    const jsonSpy = jest.spyOn(response, 'json');
    fetchMock.mockResolvedValue(response);

    const error = (await request('/api/events/my', { token: 'expirado' }).catch((e) => e)) as ApiError;
    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(401);
    expect(jsonSpy).not.toHaveBeenCalled();
  });

  it('falha de rede: NetworkError distinguível de erro de API (AC4)', async () => {
    fetchMock.mockRejectedValue(new TypeError('Network request failed'));

    const error = (await request('/api/events/my').catch((e) => e)) as ApiError;
    expect(error).toBeInstanceOf(NetworkError);
    expect(error).not.toBeInstanceOf(ApiError);
  });

  it('corpo não-JSON (ex.: HTML de proxy): NetworkError, sem crash (edge case)', async () => {
    fetchMock.mockResolvedValue(emptyBodyResponse(502));

    const error = (await request('/api/events/my').catch((e) => e)) as ApiError;
    expect(error).toBeInstanceOf(NetworkError);
  });

  it('envelope success:false mesmo com 200: ApiError com a message geral (edge case)', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(200, { success: false, message: 'Operação não permitida' }),
    );

    const error = (await request('/api/events/my').catch((e) => e)) as ApiError;
    expect(error).toBeInstanceOf(ApiError);
    expect(error.message).toBe('Operação não permitida');
  });

  it('usa a base URL do env e envia Authorization quando há token (AC5)', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { success: true, message: '', data: null }));

    await request('/api/events/my', { token: 'tok-123' });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('http://test.local:8080/api/events/my');
    expect(init.headers.Authorization).toBe('Bearer tok-123');
  });
});
