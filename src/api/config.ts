export function getBaseUrl(): string {
  const url = process.env.EXPO_PUBLIC_API_URL;
  if (!url) {
    throw new Error(
      'EXPO_PUBLIC_API_URL não definida. Crie um .env na raiz (veja .env.example) e reinicie o bundler.',
    );
  }
  return url.replace(/\/$/, '');
}
