// theme.ts — tokens do DESIGN_SYSTEM.md §9 (copiados exatamente; não reinterpretar)
export const colors = {
  canvas: '#FFFFFF',
  ivory: '#F2F0EA',
  editorial: '#121212',
  overlay: 'rgba(0,0,0,0.55)',
  ink: '#000000',
  inkMuted: 'rgba(18,18,18,0.75)',
  border: 'rgba(0,0,0,0.5)',
  borderSubtle: 'rgba(0,0,0,0.08)',
  editorialText: '#FFFFFF',
  editorialTextMuted: 'rgba(255,255,255,0.75)',
  editorialBorder: 'rgba(255,255,255,0.5)',
  accent: '#136F99',
  success: '#3D5A3D',
  error: '#8C3B2E',
  warning: '#8A6D1F',
} as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32, huge: 48 } as const;

// Cantos retos são a assinatura — 'minor' e 'pill'/'circle' são exceções funcionais
export const radius = { none: 0, minor: 4, pill: 64, circle: 999 } as const;

export const type = {
  display: { fontFamily: 'Archivo_300Light',    fontSize: 32, lineHeight: 38, letterSpacing: 0.5 },
  title:   { fontFamily: 'Archivo_300Light',    fontSize: 24, lineHeight: 30, letterSpacing: 0.5 },
  heading: { fontFamily: 'Archivo_400Regular',  fontSize: 18, lineHeight: 24, letterSpacing: 1, textTransform: 'uppercase' },
  body:    { fontFamily: 'Cormorant_500Medium', fontSize: 17, lineHeight: 24 },
  label:   { fontFamily: 'Cormorant_500Medium', fontSize: 16, lineHeight: 16 },
  caption: { fontFamily: 'Cormorant_400Regular', fontSize: 12, lineHeight: 14.5 },
} as const;
