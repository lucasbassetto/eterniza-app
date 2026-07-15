import { request } from './client';

export interface Credentials {
  email: string;
  password: string;
}

/** `POST /api/auth/login` → hostToken (24h). */
export async function login(credentials: Credentials): Promise<string> {
  const data = await request<{ token: string }>('/api/auth/login', {
    method: 'POST',
    body: credentials,
  });
  return data.token;
}

/**
 * `POST /api/auth/register` → hostToken. Sem UI por decisão de produto
 * (conta criada/entregue pelo serviço) — usado para criar contas de teste.
 */
export async function register(name: string, credentials: Credentials): Promise<string> {
  const data = await request<{ token: string }>('/api/auth/register', {
    method: 'POST',
    body: { name, ...credentials },
  });
  return data.token;
}
