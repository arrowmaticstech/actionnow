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

/** Check times from startTime, every intervalMinutes, for durationHours (default 24h). */
export function generateScheduleSlots(startTimeStr, intervalMinutes, durationHours = 24) {
  if (!startTimeStr || intervalMinutes == null || intervalMinutes === '') return [];

  const start = new Date(startTimeStr);
  if (Number.isNaN(start.getTime())) return [];

  const intervalMs = Number(intervalMinutes) * 60 * 1000;
  if (!Number.isFinite(intervalMs) || intervalMs <= 0) return [];

  const endMs = start.getTime() + durationHours * 60 * 60 * 1000;
  const slots = [];
  for (let t = start.getTime(); t < endMs; t += intervalMs) {
    slots.push(new Date(t));
  }
  return slots;
}

export function formatSlotTime(date) {
  return date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function groupSlotsByDay(slots) {
  const groups = [];
  for (const slot of slots) {
    const dayKey = slot.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
    const last = groups[groups.length - 1];
    if (last?.dayKey === dayKey) {
      last.slots.push(slot);
    } else {
      groups.push({ dayKey, slots: [slot] });
    }
  }
  return groups;
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
