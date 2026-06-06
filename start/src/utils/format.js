/**
 * Display formatters ported from assets/js/main.js interval & boss-number updates.
 */

export function formatInterval(value) {
  const val = Number(value);
  if (val <= 30) return `${val} min`;
  return `${val / 60} hr`;
}

export function formatBossNumber(bossNumbers) {
  const inputs = bossNumbers.map((n) => n.trim()).filter(Boolean);
  if (inputs.length === 0) return 'None';
  const suffix = inputs.length > 1 ? ` (+${inputs.length - 1} more)` : '';
  return `+${inputs[0]}${suffix}`;
}

export function formatGroupCount(count) {
  return `${count} group${count !== 1 ? 's' : ''}`;
}

export function formatKeywordCount(count) {
  return `${count} keyword${count !== 1 ? 's' : ''}`;
}
