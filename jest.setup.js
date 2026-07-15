// Env de teste — os testes nunca falam com um backend real (AD-003: real = UAT)
process.env.EXPO_PUBLIC_API_URL = 'http://test.local:8080';

// Secure store em memória para todas as suítes (módulo nativo indisponível no jest)
jest.mock('expo-secure-store');
