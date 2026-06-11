/**
 * Full Reports API — single /bundle call, phone-scoped full rows.
 */

import { resolveOwnerEmail } from '../lib/main';

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL ?? '').replace(/\/$/, '');
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';
const USE_DEV_PROXY = import.meta.env.DEV && import.meta.env.VITE_SUPABASE_USE_PROXY !== 'false';

function getBaseUrl() {
  if (USE_DEV_PROXY) return '/supabase-functions/full-reports';
  if (!SUPABASE_URL) throw new Error('VITE_SUPABASE_URL is not configured');
  return `${SUPABASE_URL}/functions/v1/full-reports`;
}

async function postRoute(path, body) {
  if (!SUPABASE_ANON_KEY) throw new Error('VITE_SUPABASE_ANON_KEY is not configured');

  const res = await fetch(getBaseUrl(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ ...body, route: path }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error('full-reports edge function not found — deploy with: npx supabase functions deploy full-reports --no-verify-jwt');
    }
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

function ownerPayload(owner) {
  return {
    owner_email: resolveOwnerEmail(owner?.ownerEmail),
    owner_phone_num: owner.ownerPhone,
  };
}

/** All sections — full DB rows filtered by owner_phone_num */
export function fetchBundle(owner) {
  return postRoute('/bundle', ownerPayload(owner));
}

/** Latest monitor_settings row for owner — used to prefill /start form */
export function fetchMonitorConfig(owner) {
  return postRoute('/config', ownerPayload(owner));
}

/** Latest monitor_results row — no date filter, limit 1 */
export function fetchLatestReport(owner) {
  return postRoute('/report/latest', ownerPayload(owner));
}
