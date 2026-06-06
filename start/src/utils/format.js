/**
 * Display formatters ported from assets/js/main.js interval & boss-number updates.
 */

export function getGroupValue(entry) {
  if (typeof entry === 'string') return entry;
  return entry?.value ?? '';
}

export function getGroupLabel(entry) {
  if (typeof entry === 'string') return entry;
  return entry?.label || entry?.value || '';
}

export function getBossNumberValue(entry) {
  if (typeof entry === 'string') return entry;
  return entry?.value ?? '';
}

export function isBossNumberVerified(entry) {
  return typeof entry === 'object' && entry?.verified === true;
}

export function formatInterval(value) {
  const val = Number(value);
  if (val <= 30) return `${val} min`;
  return `${val / 60} hr`;
}

export function formatBossNumber(bossNumbers) {
  const inputs = bossNumbers.map(getBossNumberValue).map((n) => n.trim()).filter(Boolean);
  if (inputs.length === 0) return 'None';

  const formatOne = (value) => {
    if (value.includes('@')) return value.replace(/@.*$/, '');
    return value.startsWith('+') ? value : `+${value}`;
  };

  const primary = formatOne(inputs[0]);
  const suffix = inputs.length > 1 ? ` (+${inputs.length - 1} more)` : '';
  return `${primary}${suffix}`;
}

export function formatContentTypes(contentTypes) {
  const selected = Object.entries(contentTypes)
    .filter(([, checked]) => checked)
    .map(([type]) => type);
  if (selected.length === 0) return 'None';
  return selected.join(', ');
}

export function formatGroupCount(count) {
  return `${count} group${count !== 1 ? 's' : ''}`;
}

export function formatKeywordCount(count) {
  return `${count} keyword${count !== 1 ? 's' : ''}`;
}
