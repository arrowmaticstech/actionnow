/**
 * Port of start/reference/start.js — WhatsApp group fetch & config save API.
 */

const GROUP_LIST_WEBHOOK = 'https://arrowmatics.app.n8n.cloud/webhook/get-whatsapp-group-list';
const SAVE_CONFIG_URL = 'https://jsonplaceholder.typicode.com/posts';

export function parseGroupListResponse(data) {
  let groups = [];

  if (Array.isArray(data) && data.length > 0 && data[0].success !== undefined && data[0].data) {
    groups = data[0].data;
  } else if (data && data.success !== undefined && data.data) {
    groups = data.data;
  } else {
    groups = Array.isArray(data) ? data : (data.groups || []);
  }

  return groups
    .map((group) => (typeof group === 'object' ? (group.name || group.id) : group))
    .filter((name) => !!name);
}

export async function fetchWhatsAppGroups(phoneNumber) {
  const response = await fetch(GROUP_LIST_WEBHOOK, {
    method: 'POST',
    body: new URLSearchParams({ phonenumber: phoneNumber }),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch groups');
  }

  const data = await response.json();
  return parseGroupListResponse(data);
}

export function buildConfigPayload(config) {
  return {
    groups: config.groups,
    startTime: config.startTime || '',
    interval: config.interval || '15',
    bossNumbers: config.bossNumbers.map((n) => n.trim()).filter(Boolean),
    keywords: config.keywords,
    contentTypes: config.contentTypes,
  };
}

export async function saveConfiguration(config) {
  const payload = buildConfigPayload(config);
  console.log('Sending data to API:', payload);

  const response = await fetch(SAVE_CONFIG_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Failed to save configuration');
  }

  const data = await response.json();
  console.log('Successfully saved to API!', data);
  return data;
}
