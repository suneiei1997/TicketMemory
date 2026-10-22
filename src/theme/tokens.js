export const colors = {
  bg: '#0C0B12',
  surface: '#17151F',
  surfaceHi: '#211E2B',
  line: 'rgba(255,255,255,0.09)',
  limeSoft: 'rgba(220,255,60,0.14)',
  text: '#F2F2F2',
  sub: '#8C8C8C',
  faint: '#555555',
  lime: '#DCFF3C',
  limeInk: '#0A0A0A',
  grey: '#C9CBD0',
  danger: '#FF5A4E',
};

// Anuphan has no variable weight on native: each weight is its own family.
export const font = {
  regular: 'Anuphan_400Regular',
  medium: 'Anuphan_500Medium',
  semibold: 'Anuphan_600SemiBold',
  bold: 'Anuphan_700Bold',
};

export const type = {
  display: { fontFamily: font.bold, fontSize: 40, lineHeight: 56, letterSpacing: -0.5 },
  title: { fontFamily: font.semibold, fontSize: 24, lineHeight: 34, letterSpacing: -0.2 },
  body: { fontFamily: font.regular, fontSize: 15, lineHeight: 21 },
  bodyStrong: { fontFamily: font.semibold, fontSize: 15, lineHeight: 21 },
  label: { fontFamily: font.medium, fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase' },
  number: { fontFamily: font.bold, fontSize: 56, lineHeight: 68, letterSpacing: -1.5, fontVariant: ['tabular-nums'] },
};
