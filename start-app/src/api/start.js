/**
 * Port of start/reference/start.js — WhatsApp group fetch & config save API.
 */

import { fetchLatestReport } from './fullReports';
import { syncConnection, normalizePhoneNumber } from './wasender';
import { getBossNumberValue, getGroupValue } from '../utils/format';
import { DEFAULT_OWNER_EMAIL, DEFAULT_OWNER_PHONE, resolveOwnerEmail } from '../lib/main';

const API_BASE = 'https://arrowmatics.app.n8n.cloud/webhook';
const API_TEST_BASE = 'https://arrowmatics.app.n8n.cloud/webhook-test';
const GROUP_LIST_WEBHOOK = `${API_BASE}/get-whatsapp-group-list/v2`;
const CONTACT_LIST_WEBHOOK = `${API_BASE}/get-whatsapp-contact-list/v2`;
const SAVE_CONFIG_URL = `${API_BASE}/action-now-save-config/v2`;
const DEL_CONFIG_URL = `${API_BASE}/action-now-del-config/v2`;
const GET_REPORT_URL = `${API_BASE}/action-now-get-report/v2`;
const LID_TO_PHONE_URL = `${API_BASE}/get-whatsapp-pin-from-lid/v2`;

export const REPORT_POLL_MS = 60_000;

export const LIST_PAGE_LIMIT = 35;

function buildPaginatedListBody(phoneNumber, page, ownerEmail) {
  const normalizedPhone = normalizePhoneNumber(phoneNumber);
  const params = new URLSearchParams({
    phonenumber: normalizedPhone,
    phone_number: normalizedPhone,
    paginated: 'true',
    page: String(page),
    limit: String(LIST_PAGE_LIMIT),
  });
  params.set('owner_email', ownerEmail?.trim() || DEFAULT_OWNER_EMAIL);
  return params;
}

async function fetchListWithSyncRetry(fetchFn, owner = {}) {
  try {
    return await fetchFn();
  } catch (error) {
    if (error?.code !== 'WHATSAPP_NOT_PAIRED' || !owner.ownerPhone) throw error;
    try {
      await syncConnection({
        ownerEmail: resolveOwnerEmail(owner.ownerEmail),
        phoneNumber: owner.ownerPhone,
        whatsappSession: owner.wasenderSessionId,
      });
      return await fetchFn();
    } catch {
      throw error;
    }
  }
}

export class WhatsAppNotPairedError extends Error {
  constructor(message = 'No WhatsApp connection found. Pair your device first.') {
    super(message);
    this.name = 'WhatsAppNotPairedError';
    this.code = 'WHATSAPP_NOT_PAIRED';
  }
}

export class WhatsAppFetchTimeoutError extends Error {
  constructor(message = 'Oops! It took longer than expected. Please try again in a moment.') {
    super(message);
    this.name = 'WhatsAppFetchTimeoutError';
    this.code = 'WHATSAPP_FETCH_TIMEOUT';
  }
}

function getResponseRoot(data) {
  if (Array.isArray(data) && data.length > 0 && data[0].success !== undefined) {
    return data[0];
  }
  return data;
}

function parseNestedApiMessage(raw) {
  const str = String(raw ?? '').trim();
  if (!str) return '';

  const jsonMatch = str.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      const inner = parsed.message ?? parsed.error;
      if (inner) return String(inner).trim();
    } catch {
      // fall through
    }
  }

  return str;
}

function extractListErrorMessage(data, status) {
  const candidates = [];

  if (data?.message) candidates.push(data.message);
  if (data?.error) candidates.push(data.error);

  const root = getResponseRoot(data);
  if (root?.message) candidates.push(root.message);
  if (root?.error) candidates.push(root.error);

  for (const candidate of candidates) {
    const parsed = parseNestedApiMessage(candidate);
    if (parsed) return parsed;
  }

  if (status === 408 || status === 504) {
    return 'Oops! It took longer than expected. Please try again in a moment.';
  }

  return `Request failed (${status})`;
}

function isTimeoutLike(status, message) {
  return status === 408
    || status === 504
    || status === 503
    || /took longer than expected/i.test(message)
    || /try again in a moment/i.test(message)
    || /timeout/i.test(message);
}

function isNotPairedLike(message) {
  return /no whatsapp connection/i.test(message)
    || /pair your device/i.test(message);
}

function throwListWebhookFailure(message, status = 0) {
  if (isTimeoutLike(status, message)) {
    throw new WhatsAppFetchTimeoutError(message);
  }
  if (isNotPairedLike(message)) {
    throw new WhatsAppNotPairedError(message);
  }
  throw new Error(message || 'Request failed');
}

async function readListWebhookResponse(response) {
  const rawText = await response.text();
  let data = null;

  try {
    data = rawText ? JSON.parse(rawText) : {};
  } catch {
    data = { message: rawText };
  }

  const message = extractListErrorMessage(data, response.status);

  if (!response.ok) {
    throwListWebhookFailure(message, response.status);
  }

  const root = getResponseRoot(data);
  if (root?.success === false) {
    const msg = String(root.error ?? root.message ?? message).trim();
    throwListWebhookFailure(msg || message, response.status);
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

export async function fetchWhatsAppGroups(phoneNumber, page = 1, owner = {}) {
  const ownerEmail = resolveOwnerEmail(typeof owner === 'string' ? owner : owner.ownerEmail);
  const ownerCtx = typeof owner === 'string'
    ? { ownerEmail, ownerPhone: normalizePhoneNumber(phoneNumber) }
    : { ownerEmail, ownerPhone: owner.ownerPhone, wasenderSessionId: owner.wasenderSessionId };

  const doFetch = async () => {
    const response = await fetch(GROUP_LIST_WEBHOOK, {
      method: 'POST',
      body: buildPaginatedListBody(phoneNumber, page, ownerEmail),
    });
    const data = await readListWebhookResponse(response);
    const items = parseGroupListResponse(data);
    return { items, ...extractPaginationMeta(data, items.length, page) };
  };

  return fetchListWithSyncRetry(doFetch, ownerCtx);
}

export async function fetchWhatsAppContacts(phoneNumber, page = 1, owner = {}) {
  const ownerEmail = resolveOwnerEmail(typeof owner === 'string' ? owner : owner.ownerEmail);
  const ownerCtx = typeof owner === 'string'
    ? { ownerEmail, ownerPhone: normalizePhoneNumber(phoneNumber) }
    : { ownerEmail, ownerPhone: owner.ownerPhone, wasenderSessionId: owner.wasenderSessionId };

  const doFetch = async () => {
    const response = await fetch(CONTACT_LIST_WEBHOOK, {
      method: 'POST',
      body: buildPaginatedListBody(phoneNumber, page, ownerEmail),
    });
    const data = await readListWebhookResponse(response);
    const items = parseContactListResponse(data);
    return { items, ...extractPaginationMeta(data, items.length, page) };
  };

  return fetchListWithSyncRetry(doFetch, ownerCtx);
}

function contentTypesToArray(contentTypes) {
  return Object.entries(contentTypes)
    .filter(([, checked]) => checked)
    .map(([type]) => type);
}

/** Postgres text[] — never send null/undefined (n8n rejects non-arrays). */
export function ensureStringArray(value) {
  if (Array.isArray(value)) {
    return value.map((v) => String(v).trim()).filter(Boolean);
  }
  if (value == null || value === '') return [];
  return [String(value).trim()].filter(Boolean);
}

/** Plain phone → WhatsApp JID; already-suffixed values pass through. */
export function normalizeContactJid(value) {
  const v = String(value).trim();
  if (!v) return null;
  if (v.includes('@')) return v;
  const digits = v.replace(/\D/g, '');
  return digits ? `${digits}@s.whatsapp.net` : null;
}

export function contactJidsFromConfig(config) {
  const raw = config.fromContacts ?? config.from_contact_jids ?? [];
 
  return ensureStringArray(raw)
    .map(normalizeContactJid)
    .filter(Boolean);
}

function toIsoDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function fromIsoToDatetimeLocal(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

const CONTENT_TYPE_KEYS = ['text', 'audio', 'image', 'document'];

/** Maps monitor_settings DB row → UI config shape (inverse of buildConfigPayload). */
export function mapDbConfigToUi(row, baseConfig = {}) {
  if (!row || typeof row !== 'object') return null;

  const selectedTypes = ensureStringArray(row.what_content_types);
  const contentTypes = {};
  for (const type of CONTENT_TYPE_KEYS) {
    contentTypes[type] = selectedTypes.length ? selectedTypes.includes(type) : (baseConfig.contentTypes?.[type] ?? false);
  }

  const refreshSeconds = Number(row.refresh_seconds);
  const intervalMinutes = Number.isFinite(refreshSeconds) && refreshSeconds > 0
    ? Math.round(refreshSeconds / 60)
    : Number(baseConfig.interval) || 15;

  const groups = ensureStringArray(row.from_group_ids).map((value) => ({ label: value, value }));
  const fromContacts = ensureStringArray(row.from_contact_jids);
  const recipients = ensureStringArray(row.to_receipient_phone_ids);
  const bossNumbers = recipients.length
    ? recipients.map((value) => ({ value, verified: true }))
    : baseConfig.bossNumbers;

  return {
    ...baseConfig,
    supervisionLabel: String(row.monitor_name ?? row.supervision_label ?? '').trim()
      || baseConfig.supervisionLabel
      || '',
    groups: groups.length ? groups : baseConfig.groups,
    fromContacts: fromContacts.length ? fromContacts : (baseConfig.fromContacts ?? []),
    bossNumbers,
    keywords: ensureStringArray(row.what_content_keywords).length
      ? ensureStringArray(row.what_content_keywords)
      : baseConfig.keywords,
    contentTypes,
    startTime: fromIsoToDatetimeLocal(row.from_date) || baseConfig.startTime,
    endTime: fromIsoToDatetimeLocal(row.to_date) || baseConfig.endTime || '',
    interval: String(intervalMinutes),
  };
}

export function isLidContact(value) {
  return String(value).toLowerCase().includes('@lid');
}

export async function fetchPhoneFromLid(lid, ownerEmail = '', ownerPhone = '') {
  const response = await fetch(LID_TO_PHONE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      lid,
      owner_email: resolveOwnerEmail(ownerEmail),
      phone_number: ownerPhone || undefined,
    }),
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

export async function resolveRecipientPhoneIds(recipients, owner = {}) {
  const values = recipients.map((v) => v.trim()).filter(Boolean);

  return Promise.all(
    values.map(async (value) => {
      if (!isLidContact(value)) return value;
      return fetchPhoneFromLid(value, owner.ownerEmail, owner.ownerPhone);
    }),
  );
}

/** Maps UI config → actionnow.monitor_settings columns for n8n/Supabase. */
export function buildConfigPayload(config, resolvedRecipients, owner = {}) {
  const supervisionLabel = config.supervisionLabel?.trim() || 'Untitled supervision';
  const recipients = resolvedRecipients ?? config.bossNumbers
    .map(getBossNumberValue)
    .map((n) => n.trim())
    .filter(Boolean);

  return {
    supervision_label: supervisionLabel,
    monitor_name: supervisionLabel,
    owner_email: resolveOwnerEmail(owner.ownerEmail),
    owner_phone_num: owner.ownerPhone?.trim() || DEFAULT_OWNER_PHONE,
    from_group_ids: ensureStringArray(
      config.groups?.map(getGroupValue),
    ),
    from_contact_jids: contactJidsFromConfig(config),
    to_receipient_phone_ids: ensureStringArray(recipients),
    what_content_keywords: ensureStringArray(config.keywords),
    what_content_types: ensureStringArray(contentTypesToArray(config.contentTypes)),
    from_date: toIsoDate(config.startTime),
    to_date: toIsoDate(config.endTime),
    refresh_seconds: Number(config.interval) * 60,
  };
}

export function validateConfigForSave(config) {
  const groupIds = ensureStringArray(config.groups?.map(getGroupValue));
  const recipients = config.bossNumbers
    .map(getBossNumberValue)
    .map((n) => n.trim())
    .filter(Boolean);

  if (!groupIds.length && !recipients.length) {
    throw new Error(
      'Please add a group to monitor and a target number to report to before saving.',
    );
  }
  if (!groupIds.length) {
    throw new Error('Please add at least one group to monitor before saving.');
  }
  if (!recipients.length) {
    throw new Error('Please add at least one target number to report to before saving.');
  }
}

export async function saveConfiguration(config, owner = {}) {
  validateConfigForSave(config);

  const rawRecipients = config.bossNumbers
    .map(getBossNumberValue)
    .map((n) => n.trim())
    .filter(Boolean);

  const resolvedRecipients = await resolveRecipientPhoneIds(rawRecipients, owner);
  const payload = buildConfigPayload(config, resolvedRecipients, owner);
  console.log('Sending config to n8n:', payload);

  await fetch(DEL_CONFIG_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

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

/** Normalizes one monitor_results row from n8n/Supabase. */
export function mapMonitorReport(row) {
  if (!row || typeof row !== 'object') return null;

  return {
    id: row.id ?? null,
    monitorSettingId: row.monitor_setting_id ?? null,
    ownerEmail: row.owner_email ?? '',
    ownerPhone: row.owner_phone_num ?? '',
    markdown: String(row.actual_results ?? ''),
    html: null,
    createdDate: row.created_date ?? null,
  };
}

/** Parses webhook response — array of reports or single object. */
export function parseMonitorReportResponse(data) {
  const rows = Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
      ? data.data
      : data?.id
        ? [data]
        : [];

  return rows
    .map(mapMonitorReport)
    .filter(Boolean)
    .sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
}

async function fetchLatestReportsFromN8n(ownerEmail, ownerPhone) {
  const response = await fetch(GET_REPORT_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      owner_email: ownerEmail,
      owner_phone_num: ownerPhone,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch reports (${response.status})`);
  }

  const data = await response.json();
  return parseMonitorReportResponse(data).slice(0, 1);
}

export async function fetchLatestReports({ ownerEmail, ownerPhone } = {}) {
  const email = resolveOwnerEmail(ownerEmail);
  const phone = ownerPhone?.trim();
  if (!phone) return [];

  try {
    const result = await fetchLatestReport({ ownerEmail: email, ownerPhone: phone });
    if (result?.found && result.report) {
      const mapped = mapMonitorReport(result.report);
      return mapped ? [mapped] : [];
    }
    return [];
  } catch (edgeErr) {
    console.warn('Edge /report/latest failed, falling back to n8n:', edgeErr);
    return fetchLatestReportsFromN8n(email, phone);
  }
}
