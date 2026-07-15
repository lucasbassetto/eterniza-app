import { QueryClient } from '@tanstack/react-query';

/**
 * Singleton do app (provido no _layout raiz). Testes limpam com queryClient.clear().
 * staleTime: dados de evento não mudam a cada navegação — sem ele, cada troca de
 * tela (convite→câmera) refaz o GET do evento à toa. Telas "ao vivo" (photoCount
 * do host, Etapa 10) devem sobrescrever com refetchInterval próprio.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 5 * 60 * 1000 },
  },
});
