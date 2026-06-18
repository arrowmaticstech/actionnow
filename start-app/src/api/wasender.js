/**
 * n8n Wasender pairing proxy — mirrors start-app/n8n/n8n-whatsender-api.json
 */

import { resolveOwnerEmail } from '../lib/main';

const API_BASE =
  import.meta.env.VITE_N8N_WEBHOOK_BASE ?? 'https://n8n.srv1756144.hstgr.cloud/webhook';

const ENDPOINTS = {
  listSessions: `${API_BASE}/wasender/whatsapp-sessions/list`,
  deleteSession: `${API_BASE}/wasender/whatsapp-sessions/delete`,
  createAndPair: `${API_BASE}/wasender/create-and-pair`,
  pollStatus: `${API_BASE}/wasender/poll-status`,
  unbind: `${API_BASE}/wasender/unbind`,
  getConnection: `${API_BASE}/wasender/get-connection`,
};

export const QR_TTL_SECONDS = 30;
export const STATUS_POLL_MS = 15000; // every 15 seconds

export const DEFAULT_WEBHOOK_URL = `${API_BASE.replace(/\/$/, '')}/actionnow-receive-whatsapp`;

export const DEFAULT_WEBHOOK_EVENTS = [
  'messages.received',
  'group-participants.update',
  'qrcode.updated',
  'message.sent',
  'messages-personal.received',
  'messages-group.received',
  'message-receipt.update',
  'messages.reaction',
];

/** Wasender returns qrCode string (not base64 image) inside data.qrCode */
export function extractPairingQr(result) {
  if (!result || typeof result !== 'object') return null;
  return (
    result.qr_code
    || result.qrCode
    || result.wasender?.data?.qrCode
    || result.wasender?.data?.qr_code
    || result.wasender?.qrCode
    || null
  );
}

export function isPairingPending(result) {
  const status = String(result?.wasender_status || result?.status || '').toLowerCase();
  return status === 'pending' || status === 'need_scan' || status === 'disconnected';
}

function getResponseRoot(data) {
  if (Array.isArray(data) && data.length > 0) {
    const first = data[0];
    if (first && typeof first === 'object' && ('success' in first || 'json' in first)) {
      return first.json ?? first;
    }
  }
  return data;
}

async function postJson(url, body) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));
  const root = getResponseRoot(data);

  if (!response.ok) {
    const message = root?.message || root?.error || `Request failed (${response.status})`;
    throw new Error(message);
  }

  return root;
}

export function parseSessionList(root) {
  const payload = root?.data ?? root;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

export async function listWhatsAppSessions() {
  const root = await postJson(ENDPOINTS.listSessions, {});
  return parseSessionList(root);
}

export async function deleteWhatsAppSession(whatsappSession) {
  if (!whatsappSession) return null;
  return postJson(ENDPOINTS.deleteSession, { whatsappSession });
}

export function normalizePhoneNumber(value) {
  const trimmed = String(value ?? '').trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('+')) return trimmed;
  return `+${trimmed.replace(/\D/g, '')}`;
}

export async function createAndPair({ ownerEmail, phoneNumber, name }) {
  return postJson(ENDPOINTS.createAndPair, {
    owner_email: resolveOwnerEmail(ownerEmail),
    phone_number: normalizePhoneNumber(phoneNumber),
    name,
    account_protection: true,
    log_messages: true,
    read_incoming_messages: false,
    webhook_url: DEFAULT_WEBHOOK_URL,
    webhook_enabled: true,
    webhook_events: DEFAULT_WEBHOOK_EVENTS,
  });
}

export async function pollStatus({ ownerEmail, phoneNumber, whatsappSession } = {}) {
  return postJson(ENDPOINTS.pollStatus, {
    owner_email: resolveOwnerEmail(ownerEmail),
    phone_number: phoneNumber ? normalizePhoneNumber(phoneNumber) : undefined,
    whatsappSession: whatsappSession ?? undefined,
  });
}

export async function unbindConnection({ ownerEmail, phoneNumber, whatsappSession } = {}) {
  return postJson(ENDPOINTS.unbind, {
    owner_email: resolveOwnerEmail(ownerEmail),
    phone_number: phoneNumber ? normalizePhoneNumber(phoneNumber) : undefined,
    whatsappSession: whatsappSession ?? undefined,
  });
}

export async function getConnection({ ownerEmail, phoneNumber, whatsappSession } = {}) {
  return postJson(ENDPOINTS.getConnection, {
    owner_email: resolveOwnerEmail(ownerEmail),
    phone_number: phoneNumber ? normalizePhoneNumber(phoneNumber) : undefined,
    whatsappSession: whatsappSession ?? undefined,
    wasender_session_id: whatsappSession ?? undefined,
  });
}

/** Sync DB row from Wasender API (api_key, status) — call after pairing connects. */
export async function syncConnection({ ownerEmail, phoneNumber, whatsappSession } = {}) {
  return getConnection({ ownerEmail, phoneNumber, whatsappSession });
}
