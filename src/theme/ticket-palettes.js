// Mesh gradients for tickets: a base colour plus three blurred blobs (x/y/r are fractions of the card).
// All are bright enough for black text.
export const PALETTES = {
  orchid: { base: '#FF6FD8', blobs: [{ c: '#FFC4F0', x: 0.85, y: 0.15, r: 0.6 }, { c: '#FFD84D', x: 0.15, y: 0.95, r: 0.7 }, { c: '#B06CFF', x: 0.1, y: 0.1, r: 0.55 }] },
  acid: { base: '#DCFF3C', blobs: [{ c: '#F6FF8A', x: 0.8, y: 0.1, r: 0.6 }, { c: '#7DF2C2', x: 0.1, y: 0.9, r: 0.7 }, { c: '#FFE14D', x: 0.95, y: 0.95, r: 0.5 }] },
  ultraviolet: { base: '#9B6BFF', blobs: [{ c: '#6EA8FF', x: 0.9, y: 0.2, r: 0.65 }, { c: '#FF7AD9', x: 0.1, y: 0.9, r: 0.65 }, { c: '#D6B8FF', x: 0.15, y: 0.1, r: 0.5 }] },
  sunset: { base: '#FF8A4C', blobs: [{ c: '#FFD24D', x: 0.85, y: 0.1, r: 0.6 }, { c: '#FF4F9A', x: 0.1, y: 0.85, r: 0.7 }, { c: '#FFB8A0', x: 0.95, y: 0.95, r: 0.5 }] },
  aqua: { base: '#4FB6FF', blobs: [{ c: '#7C8CFF', x: 0.9, y: 0.15, r: 0.6 }, { c: '#C8FF4D', x: 0.1, y: 0.95, r: 0.65 }, { c: '#8FF0FF', x: 0.1, y: 0.1, r: 0.5 }] },
  peach: { base: '#FFB59A', blobs: [{ c: '#FF8FC0', x: 0.85, y: 0.2, r: 0.6 }, { c: '#D9B8FF', x: 0.1, y: 0.9, r: 0.65 }, { c: '#FFE0A8', x: 0.95, y: 0.95, r: 0.5 }] },
  mint: { base: '#7CF0C8', blobs: [{ c: '#C9B8FF', x: 0.9, y: 0.15, r: 0.6 }, { c: '#F6FF8A', x: 0.1, y: 0.9, r: 0.65 }, { c: '#8FD8FF', x: 0.95, y: 0.95, r: 0.5 }] },
  chrome: { base: '#C9CBD0', blobs: [{ c: '#FFFFFF', x: 0.85, y: 0.1, r: 0.6 }, { c: '#B8B8FF', x: 0.1, y: 0.9, r: 0.65 }, { c: '#E4E4E4', x: 0.95, y: 0.95, r: 0.5 }] },
};

export const PALETTE_KEYS = Object.keys(PALETTES);

const hash = (s) => [...String(s)].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7);

// Saved colour wins; otherwise a stable pick from the ticket id so old tickets keep their look.
export function paletteKeyFor(event) {
  if (event?.color && PALETTES[event.color]) return event.color;
  return PALETTE_KEYS[hash(event?.id ?? event?.title ?? '') % PALETTE_KEYS.length];
}

export const randomPaletteKey = () => PALETTE_KEYS[Math.floor(Math.random() * PALETTE_KEYS.length)];
