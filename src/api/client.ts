import { getBaseUrl } from './config';

/** Envelope padrão de todas as rotas da API (APP_BRIEF §3). */
export interface Envelope<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
  errors?: Record<string, string>;
}

/** Erro respondido pela API (envelope presente ou 401 de corpo vazio). */
export class ApiError extends Error {
  readonly status: number;
  /** Mapa campo → mensagem dos 400 de validação — usar direto no Input. */
  readonly errors?: Record<string, string>;

  constructor(status: number, message: string, errors?: Record<string, string>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

/** Falha antes de uma resposta da API existir (rede fora, timeout, corpo não-JSON). */
export class NetworkError extends Error {
  constructor(message = 'Não foi possível falar com o servidor. Verifique sua conexão.') {
    super(message);
    this.name = 'NetworkError';
  }
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'DELETE';
  body?: unknown;
  token?: string;
}

/**
 * Executa um request e devolve o `data` do envelope.
 * - 401 vem com corpo VAZIO (filtro de segurança): tratado pelo status, sem parse.
 * - Falha de rede/parse vira NetworkError (distinguível de ApiError).
 */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, token } = options;
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;

  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined && !isFormData) headers['Content-Type'] = 'application/json';

  let response: Response;
  try {
    response = await fetch(`${getBaseUrl()}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : isFormData ? (body as FormData) : JSON.stringify(body),
    });
  } catch {
    throw new NetworkError();
  }

  if (response.status === 401) {
    throw new ApiError(401, 'Sessão inválida ou expirada.');
  }

  let envelope: Envelope<T>;
  try {
    envelope = (await response.json()) as Envelope<T>;
  } catch {
    throw new NetworkError('Resposta inesperada do servidor.');
  }

  if (!response.ok || !envelope.success) {
    throw new ApiError(response.status, envelope.message, envelope.errors);
  }

  return envelope.data;
}
