/**
 * Port of start/reference/start.js — WhatsApp group fetch & config save API.
 */

import { getBossNumberValue, getGroupValue } from '../utils/format';
import { DEFAULT_OWNER_EMAIL, DEFAULT_OWNER_PHONE } from '../lib/main';

const API_BASE = 'https://arrowmatics.app.n8n.cloud/webhook';
const API_TEST_BASE = 'https://arrowmatics.app.n8n.cloud/webhook-test';
const GROUP_LIST_WEBHOOK = `${API_BASE}/get-whatsapp-group-list`;
const CONTACT_LIST_WEBHOOK = `${API_BASE}/get-whatsapp-contact-list`;
const SAVE_CONFIG_URL = 'https://arrowmatics.app.n8n.cloud/webhook/action-now-save-config';
const LID_TO_PHONE_URL = `${API_BASE}/get-whatsapp-pin-from-lid`;

export const LIST_PAGE_LIMIT = 10;

function buildPaginatedListBody(phoneNumber, page) {
  return new URLSearchParams({
    phonenumber: phoneNumber,
    paginated: 'true',
    page: String(page),
    limit: String(LIST_PAGE_LIMIT),
  });
}

function getResponseRoot(data) {
  if (Array.isArray(data) && data.length > 0 && data[0].success !== undefined) {
    return data[0];
  }
  return data;
}

function getPayload(data) {
  const root = getResponseRoot(data);
  return root?.data ?? data;
}

function extractPaginationMeta(data, itemCount, page) {
  const root = getResponseRoot(data);
  const nested = getPayload(data);
  const meta = nested && typeof nested === 'object' && !Array.isArray(nested) ? nested : root;

  const limit = Number(meta?.limit) || LIST_PAGE_LIMIT;
  const currentPage = Number(meta?.page) || page;
  const total = meta?.total ?? meta?.totalCount;
  const totalPages = meta?.totalPages ?? (total != null ? Math.ceil(total / limit) : undefined);
  const hasMore = meta?.hasMore ?? meta?.has_next ?? (
    totalPages != null ? currentPage < totalPages : itemCount >= limit
  );

  return { page: currentPage, limit, hasMore, total, totalPages };
}

function extractDataArray(data, fallbackKey) {
  const payload = getPayload(data);

  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.[fallbackKey])) return payload[fallbackKey];
  if (Array.isArray(data)) return data;
  return [];
}
 
function formatGroupEntry(group) {
  if (typeof group === 'string') {
    return { label: group, value: group };
  }

  const jid = group.jid || group.id || '';
  const jidStr = String(jid);
  const name = group.name?.trim() || '';
  const label = name || jidStr;

  return { label, value: jidStr };
}

export function parseGroupListResponse(data) {
  return extractDataArray(data, 'groups')
    .map(formatGroupEntry)
    .filter((group) => group.value);
}

function formatContactEntry(contact) {
  if (typeof contact === 'string') {
    return { label: contact, value: contact };
  }

  const name = contact.name?.trim()
    || contact.notify?.trim()
    || contact.verifiedName?.trim()
    || contact.pushName?.trim()
    || '';

  const identifier = contact.lid || contact.id || contact.phone || contact.number || contact.phonenumber || '';
  const identifierStr = String(identifier);
  const shortId = identifierStr.replace(/@.*$/, '');

  const value = identifierStr || name;
  const label = name
    ? (shortId ? `${name} (${shortId})` : name)
    : (shortId || identifierStr);

  return { label, value };
}

export function parseContactListResponse(data) {
  return extractDataArray(data, 'contacts')
    .map(formatContactEntry)
    .filter((contact) => contact.value);
}

export async function fetchWhatsAppGroups(phoneNumber, page = 1) {
  const response = await fetch(GROUP_LIST_WEBHOOK, {
    method: 'POST',
    body: buildPaginatedListBody(phoneNumber, page),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch groups');
  }

  const data = await response.json();
  const items = parseGroupListResponse(data);
  return { items, ...extractPaginationMeta(data, items.length, page) };
}

export async function fetchWhatsAppContacts(phoneNumber, page = 1) {
  const response = await fetch(CONTACT_LIST_WEBHOOK, {
    method: 'POST',
    body: buildPaginatedListBody(phoneNumber, page),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch contacts');
  }

  const data = await response.json();
  const items = parseContactListResponse(data);
  return { items, ...extractPaginationMeta(data, items.length, page) };
}

function contentTypesToArray(contentTypes) {
  return Object.entries(contentTypes)
    .filter(([, checked]) => checked)
    .map(([type]) => type);
}

function toIsoDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function isLidContact(value) {
  return String(value).toLowerCase().includes('@lid');
}

export async function fetchPhoneFromLid(lid) {
  const response = await fetch(LID_TO_PHONE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lid }),
  });

  if (!response.ok) {
    throw new Error(`Failed to resolve LID: ${lid}`);
  }

  const data = await response.json();
  const root = getResponseRoot(data);
  const pn = root?.data?.pn ?? data?.data?.pn ?? data?.pn;

  if (!pn) {
    throw new Error(`No phone number returned for LID: ${lid}`);
  }

  return String(pn);
}

export async function resolveRecipientPhoneIds(recipients) {
  const values = recipients.map((v) => v.trim()).filter(Boolean);

  return Promise.all(
    values.map(async (value) => {
      if (!isLidContact(value)) return value;
      return fetchPhoneFromLid(value);
    }),
  );
}

/** Maps UI config → actionnow.monitor_settings columns for n8n/Supabase. */
export function buildConfigPayload(config, resolvedRecipients) {
  const supervisionLabel = config.supervisionLabel?.trim() || 'Untitled supervision';
  const recipients = resolvedRecipients ?? config.bossNumbers
    .map(getBossNumberValue)
    .map((n) => n.trim())
    .filter(Boolean);

  return {
    supervision_label: supervisionLabel,
    monitor_name: supervisionLabel,
    owner_email: DEFAULT_OWNER_EMAIL,
    owner_phone_num: DEFAULT_OWNER_PHONE,
    from_group_ids: config.groups
      .map(getGroupValue)
      .map((id) => id.trim())
      .filter(Boolean),
    to_receipient_phone_ids: recipients,
    what_content_keywords: config.keywords,
    what_content_types: contentTypesToArray(config.contentTypes),
    from_date: toIsoDate(config.startTime),
    to_date: toIsoDate(config.endTime),
    refresh_seconds: Number(config.interval) * 60,
  };
}

export async function saveConfiguration(config) {
  const rawRecipients = config.bossNumbers
    .map(getBossNumberValue)
    .map((n) => n.trim())
    .filter(Boolean);

  const resolvedRecipients = await resolveRecipientPhoneIds(rawRecipients);
  const payload = buildConfigPayload(config, resolvedRecipients);
  console.log('Sending config to n8n:', payload);

  const response = await fetch(SAVE_CONFIG_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Failed to save configuration');
  }

  const data = await response.json().catch(() => ({}));
  console.log('Successfully saved to API!', data);
  return data;
}
