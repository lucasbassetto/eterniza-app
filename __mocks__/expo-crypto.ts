/** Mock do expo-crypto (ativado globalmente em jest.setup.js). */
let counter = 0;

export const randomUUID = jest.fn(() => `uuid-teste-${++counter}`);

export const __resetRandomUUID = () => {
  counter = 0;
  randomUUID.mockClear();
};
