import { Archivo_300Light, Archivo_400Regular } from '@expo-google-fonts/archivo';
import { Cormorant_400Regular, Cormorant_500Medium } from '@expo-google-fonts/cormorant';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Archivo_300Light,
    Archivo_400Regular,
    Cormorant_400Regular,
    Cormorant_500Medium,
  });

  useEffect(() => {
    if (fontError) {
      console.error('Falha ao carregar fontes; usando fonte do sistema.', fontError);
    }
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }} />
    </QueryClientProvider>
  );
}
