import { Redirect, Stack } from 'expo-router';

import { useAuth } from '@/api/auth-context';

/** Guarda: rotas de eventos do host exigem sessão (API-03 AC4). */
export default function HostEventsLayout() {
  const { status } = useAuth();

  if (status === 'loading') {
    return null;
  }

  if (status === 'signedOut') {
    return <Redirect href="/host/login" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
