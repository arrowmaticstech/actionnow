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

/** Initial demo value shown in status when no groups are added yet (matches reference HTML). */
export const INITIAL_GROUP_COUNT = 3;

export const TOAST_VISIBLE_MS = 3000;
export const SAVE_FLASH_MS = 2000;
export const RIPPLE_INTERVAL_MS = 50;
export const RIPPLE_DURATION_MS = 1000;
export const NAVBAR_SCROLL_THRESHOLD = 20;

export function pickRandomGroupName() {
  return RANDOM_GROUP_NAMES[Math.floor(Math.random() * RANDOM_GROUP_NAMES.length)];
}

export function getDisplayGroupCount(groups) {
  return groups.length > 0 ? groups.length : INITIAL_GROUP_COUNT;
}
