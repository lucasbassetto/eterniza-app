/** Mock em memória do expo-secure-store (ativado globalmente em jest.setup.js). */
const store = new Map<string, string>();

export const getItemAsync = jest.fn(async (key: string) => store.get(key) ?? null);
export const setItemAsync = jest.fn(async (key: string, value: string) => {
  store.set(key, value);
});
export const deleteItemAsync = jest.fn(async (key: string) => {
  store.delete(key);
});

export const __reset = () => store.clear();
export const __seed = (entries: Record<string, string>) => {
  for (const [key, value] of Object.entries(entries)) store.set(key, value);
};
export const __get = (key: string) => store.get(key);
