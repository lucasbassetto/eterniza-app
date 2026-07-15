// Env de teste — os testes nunca falam com um backend real (AD-003: real = UAT)
process.env.EXPO_PUBLIC_API_URL = 'http://test.local:8080';

// Secure store em memória para todas as suítes (módulo nativo indisponível no jest)
jest.mock('expo-secure-store');

// UUIDs determinísticos para o deviceId do convidado
jest.mock('expo-crypto');

// Câmera nativa mockada (captura real = UAT, AD-003)
jest.mock('react-native-vision-camera');

// Módulos nativos do rebuild da Etapa 7 (GPU/vibração não existem no jest).
// expo-file-system já é mockado pelo próprio jest-expo (factory); a suíte do
// pipeline registra o mock manual dela por cima quando precisa dos helpers.
jest.mock('@shopify/react-native-skia');
jest.mock('expo-haptics');
