/** Mock da VisionCamera (ativado globalmente em jest.setup.js — módulo nativo indisponível no jest). */
import { forwardRef, useImperativeHandle } from 'react';

export const __takePhotoMock = jest.fn(async () => ({
  path: '/mock/DCIM/photo-0001.jpg',
  width: 4032,
  height: 3024,
}));

export const Camera = forwardRef(function MockCamera(_props: unknown, ref) {
  useImperativeHandle(ref, () => ({ takePhoto: __takePhotoMock }));
  return null;
});

export const useCameraPermission = jest.fn(() => ({
  hasPermission: true,
  requestPermission: jest.fn(async () => true),
}));

export const useCameraDevice = jest.fn((position: string) => ({
  id: `mock-${position}`,
  position,
}));

export const useCameraFormat = jest.fn(() => undefined);

// Frame processor Skia (GPU) — inerte no jest; fluidez/visual = UAT
export const useSkiaFrameProcessor = jest.fn(() => undefined);

export const __resetVisionCamera = () => {
  __takePhotoMock.mockClear();
  __takePhotoMock.mockImplementation(async () => ({
    path: '/mock/DCIM/photo-0001.jpg',
    width: 4032,
    height: 3024,
  }));
  (useCameraPermission as jest.Mock).mockImplementation(() => ({
    hasPermission: true,
    requestPermission: jest.fn(async () => true),
  }));
  (useCameraDevice as jest.Mock).mockImplementation((position: string) => ({
    id: `mock-${position}`,
    position,
  }));
};
