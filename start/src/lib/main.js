/**
 * Port of assets/js/main.js — demo constants & display helpers.
 * UI interactions (menu, toast, ripple, etc.) live in React components/hooks.
 */

export const RANDOM_GROUP_NAMES = [
  '📊 Analytics Team',
  '🎨 Design Squad',
  '🚀 Dev Team',
  '📣 Social Media',
  '🤝 Partners',
  '🏆 Leadership',
];

export function pickRandomGroupName() {
  return RANDOM_GROUP_NAMES[Math.floor(Math.random() * RANDOM_GROUP_NAMES.length)];
}

export const TOAST_VISIBLE_MS = 3000;
export const SAVE_FLASH_MS = 2000;
export const RIPPLE_INTERVAL_MS = 50;
export const RIPPLE_DURATION_MS = 1000;
export const NAVBAR_SCROLL_THRESHOLD = 20;

export const DEFAULT_OWNER_EMAIL = 'hello@actionnow.my';
export const DEFAULT_OWNER_PHONE = '+60103364933';

export const SUGGESTED_KEYWORDS = [
  'kitchen issue smelly',
  'malfunction on',
  'staff absent',
  'customer complaint',
  'health hazard',
  'equipment broken',
  'safety issue',
  'late arrival',
  'maintenance needed',
  'out of stock',
];
