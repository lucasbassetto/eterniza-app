/**
 * CAM-01 — Config nativa do dev build (spec etapa-6-camera-basica).
 * O build em si é UAT (AD-003); aqui se trava a config que o prebuild consome:
 * scheme do deep link e plugin da VisionCamera (câmera sim, microfone não).
 */
import appJson from '../../app.json';

type PluginEntry = string | [string, Record<string, unknown>];

describe('Config nativa (CAM-01)', () => {
  const plugins = appJson.expo.plugins as PluginEntry[];

  it('scheme do deep link é eterniza (NAV-03/CAM-01 AC3)', () => {
    expect(appJson.expo.scheme).toBe('eterniza');
  });

  it('plugin da VisionCamera configurado com texto de permissão e SEM microfone', () => {
    const entry = plugins.find(
      (p): p is [string, Record<string, unknown>] =>
        Array.isArray(p) && p[0] === 'react-native-vision-camera',
    );

    expect(entry).toBeDefined();
    const options = entry![1];
    expect(options.cameraPermissionText).toEqual(expect.stringContaining('câmera'));
    expect(options.enableMicrophonePermission).toBe(false);
    expect(options.enableLocation).toBe(false);
  });
});
