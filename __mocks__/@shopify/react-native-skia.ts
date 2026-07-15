/** Mock do Skia (ativado globalmente em jest.setup.js — GPU indisponível no jest; visual = UAT). */
import type { ReactNode } from 'react';

// Componentes declarativos (miniaturas do carrossel) — não renderizam nada no jest
export const Canvas = (_props: { children?: ReactNode }) => null;
export const Image = (_props: unknown) => null;
export const ColorMatrix = (_props: unknown) => null;
export const useImage = jest.fn(() => null);

export const ImageFormat = { JPEG: 3, PNG: 4, WEBP: 6 } as const;

// API imperativa (pipeline offscreen da foto)
const encodedBytes = new Uint8Array([0xff, 0xd8, 0xff]); // "jpeg" de mentira

export const Skia = {
  Data: { fromURI: jest.fn(async () => ({ __data: true })) },
  Image: {
    MakeImageFromEncoded: jest.fn(() => ({
      width: () => 4032,
      height: () => 3024,
    })),
  },
  Surface: {
    MakeOffscreen: jest.fn(() => ({
      getCanvas: () => ({ drawImage: jest.fn(), rotate: jest.fn(), translate: jest.fn() }),
      makeImageSnapshot: () => ({ encodeToBytes: jest.fn(() => encodedBytes) }),
    })),
  },
  Paint: jest.fn(() => ({ setColorFilter: jest.fn() })),
  ColorFilter: { MakeMatrix: jest.fn(() => ({})) },
};
