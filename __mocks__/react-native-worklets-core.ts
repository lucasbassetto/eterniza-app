/** Mock do worklets-core (runtime de worklets indisponível no jest; preview real = UAT). */

export const useSharedValue = jest.fn(<T,>(initial: T) => ({ value: initial }));

export const Worklets = {
  createSharedValue: <T,>(initial: T) => ({ value: initial }),
  getCurrentThreadId: jest.fn(() => 0),
};
