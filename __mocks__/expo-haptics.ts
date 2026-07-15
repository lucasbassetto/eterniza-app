/** Mock do expo-haptics (ativado globalmente em jest.setup.js). */
export const ImpactFeedbackStyle = { Light: 'light', Medium: 'medium', Heavy: 'heavy' } as const;

export const impactAsync = jest.fn(async () => {});
export const notificationAsync = jest.fn(async () => {});
export const selectionAsync = jest.fn(async () => {});
