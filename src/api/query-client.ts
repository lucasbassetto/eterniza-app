import { QueryClient } from '@tanstack/react-query';

/** Singleton do app (provido no _layout raiz). Testes limpam com queryClient.clear(). */
export const queryClient = new QueryClient();
