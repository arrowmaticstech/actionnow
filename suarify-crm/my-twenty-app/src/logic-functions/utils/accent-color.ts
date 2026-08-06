import {
  QUOTE_TEMPLATE_ACCENT_COLOR_BLUE,
  QUOTE_TEMPLATE_ACCENT_COLOR_GRAY,
  QUOTE_TEMPLATE_ACCENT_COLOR_GREEN,
  QUOTE_TEMPLATE_ACCENT_COLOR_ORANGE,
  QUOTE_TEMPLATE_ACCENT_COLOR_PURPLE,
  QUOTE_TEMPLATE_ACCENT_COLOR_RED,
  QUOTE_TEMPLATE_ACCENT_COLOR_TEAL,
} from 'src/constants/universal-identifiers';

// Hex accent colors, one per template accent color option.
export const ACCENT_COLOR_HEX: Record<string, string> = {
  [QUOTE_TEMPLATE_ACCENT_COLOR_TEAL]: '#0d9488',
  [QUOTE_TEMPLATE_ACCENT_COLOR_BLUE]: '#1961ed',
  [QUOTE_TEMPLATE_ACCENT_COLOR_GREEN]: '#16a34a',
  [QUOTE_TEMPLATE_ACCENT_COLOR_ORANGE]: '#ea580c',
  [QUOTE_TEMPLATE_ACCENT_COLOR_PURPLE]: '#7c3aed',
  [QUOTE_TEMPLATE_ACCENT_COLOR_RED]: '#dc2626',
  [QUOTE_TEMPLATE_ACCENT_COLOR_GRAY]: '#64748b',
};

export const resolveAccentColor = (accentColor?: string | null): string =>
  ACCENT_COLOR_HEX[accentColor ?? ''] ?? ACCENT_COLOR_HEX[QUOTE_TEMPLATE_ACCENT_COLOR_TEAL];

// Converts a #rrggbb hex string to pdf-lib's rgb() color object.
export const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;
  return { r, g, b };
};
