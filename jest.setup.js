// Env de teste — os testes nunca falam com um backend real (AD-003: real = UAT)
process.env.EXPO_PUBLIC_API_URL = 'http://test.local:8080';

// Secure store em memória para todas as suítes (módulo nativo indisponível no jest)
jest.mock('expo-secure-store');

// UUIDs determinísticos para o deviceId do convidado
jest.mock('expo-crypto');

// Câmera nativa mockada (captura real = UAT, AD-003)
jest.mock('react-native-vision-camera');
