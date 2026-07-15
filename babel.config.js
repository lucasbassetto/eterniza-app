module.exports = function (api) {
  // O plugin dos worklets (VisionCamera) transforma funções 'worklet' para a
  // thread da câmera. No jest ele não serve (frame processors são mockados —
  // AD-003) e conflita com os mocks do RN, então só entra fora de teste.
  const isTest = api.env('test');

  return {
    presets: ['babel-preset-expo'],
    plugins: isTest ? [] : ['react-native-worklets-core/plugin'],
  };
};
