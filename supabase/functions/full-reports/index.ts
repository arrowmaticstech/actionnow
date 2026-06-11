import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2';

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

/** public views — see migration 010_public_actionnow_read_views.sql */
const T = {
  connections: 'an_user_whatsapp_connections',
  messages: 'an_whatsapp_messages',
  messageMedia: 'an_whatsapp_message_media',
  interpretations: 'an_whatsapp_media_interpretations',
  attemptLogs: 'an_monitor_attempt_logs',
  results: 'an_monitor_results',
} as const;

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

type OwnerContext = {
  owner_email: string;
  owner_phone_num: string;
};

type DbClient = SupabaseClient;

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function error(message: string, status = 400) {
  return json({ error: message }, status);
}

function normalizePhone(value: string | null | undefined) {
  const trimmed = String(value ?? '').trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('+')) return trimmed;
  const digits = trimmed.replace(/\D/g, '');
  return digits ? `+${digits}` : '';
}

function phoneDigits(value: string | null | undefined) {
  return String(value ?? '').replace(/\D/g, '');
}

/** +601…, 601…, digits-only — rows may store any of these or null/empty */
function phoneVariants(phone: string) {
  const normalized = normalizePhone(phone);
  const digits = phoneDigits(normalized);
  return [...new Set([normalized, digits, digits ? `+${digits}` : ''].filter(Boolean))];
}

function logLine(scope: string, payload: Record<string, unknown>) {
  console.log(JSON.stringify({ scope, ts: new Date().toISOString(), ...payload }));
}

type QueryLog = {
  table: string;
  filter: string;
  row_count: number;
  error: string | null;
  sample_ids: string[];
};

function logQuery(log: QueryLog, owner: OwnerContext, route: string) {
  logLine(`query:${route}`, {
    table: log.table,
    filter: log.filter,
    row_count: log.row_count,
    error: log.error,
    sample_ids: log.sample_ids,
    owner_email: owner.owner_email,
    owner_phone_num: owner.owner_phone_num,
  });
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function getRoute(pathname: string) {
  return pathname
    .replace(/^\/functions\/v1\/full-reports/, '')
    .replace(/^\/full-reports/, '')
    .replace(/\/$/, '') || '/';
}

function parseLimit(raw: unknown) {
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 1) return DEFAULT_LIMIT;
  return Math.min(Math.floor(n), MAX_LIMIT);
}

function db() {
  const url = Deno.env.get('SUPABASE_URL') ?? '';
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  if (!url || !key) throw new Error('Missing Supabase env');
  return createClient(url, key);
}

async function parseBody(req: Request) {
  try {
    return await req.json();
  } catch {
    return {};
  }
}

/**
 * Scope by owner_phone_num — .in() avoids PostgREST .or() breaking on "+" in +601…
 */
function forPhone<T extends { in: (col: string, vals: string[]) => T }>(query: T, phone: string): T {
  return query.in('owner_phone_num', phoneVariants(phone));
}

function phoneFilterDescription(phone: string) {
  const variants = phoneVariants(phone);
  return `owner_phone_num IN (${variants.map((v) => `'${v}'`).join(', ')})`;
}

/** @deprecated list routes — email scope */
function forOwner<T extends { ilike: (col: string, val: string) => T }>(query: T, owner: OwnerContext): T {
  return query.ilike('owner_email', normalizeEmail(owner.owner_email));
}

function ownerFilterDescription(owner: OwnerContext) {
  return `owner_email ILIKE '${normalizeEmail(owner.owner_email)}'`;
}

async function countForEmail(sb: DbClient, table: string, owner: OwnerContext) {
  const { count, error: qErr } = await sb
    .from(table)
    .select('id', { count: 'exact', head: true })
    .ilike('owner_email', normalizeEmail(owner.owner_email));
  return { count: count ?? 0, error: qErr?.message ?? null };
}

function sampleIds(rows: Array<{ id?: string; message_id?: string }> | null) {
  return (rows ?? []).slice(0, 3).map((r) => r.id ?? r.message_id ?? '?');
}

async function findConnectedConnection(sb: DbClient, email: string, phone: string) {
  const variants = phoneVariants(phone);
  const { data, error: qErr } = await sb
    .from(T.connections)
    .select('id, status, phone_number')
    .ilike('owner_email', normalizeEmail(email))
    .in('phone_number', variants)
    .eq('status', 'connected')
    .limit(1)
    .maybeSingle();
  if (qErr) throw qErr;
  return { row: data, matched_phone: data?.phone_number ?? null };
}

async function assertConnectedOwner(sb: DbClient, owner: OwnerContext) {
  const email = owner.owner_email?.trim();
  const phone = normalizePhone(owner.owner_phone_num);
  if (!email || !phone) {
    throw new Response(JSON.stringify({ error: 'owner_email and owner_phone_num required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  let connectionRow: { id: string; status: string; phone_number: string } | null = null;
  let matchedPhone: string | null = null;
  try {
    const found = await findConnectedConnection(sb, email, phone);
    connectionRow = found.row;
    matchedPhone = found.matched_phone;
  } catch (qErr) {
    const message = qErr instanceof Error ? qErr.message : 'Connection lookup failed';
    throw new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (!connectionRow) {
    const { data: anyConn } = await sb
      .from(T.connections)
      .select('phone_number, status')
      .ilike('owner_email', normalizeEmail(email));
    throw new Response(
      JSON.stringify({
        error: 'No connected WhatsApp device for this owner',
        debug: {
          requested_email: email,
          requested_phone: phone,
          phone_variants_tried: phoneVariants(phone),
          connections_for_email: anyConn ?? [],
        },
      }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }

  logLine('assertConnectedOwner', {
    owner_email: email,
    owner_phone_num: phone,
    connection_phone_in_db: connectionRow.phone_number,
    matched_phone: matchedPhone,
  });

  return { owner_email: normalizeEmail(email), owner_phone_num: phone };
}

async function dbCountsForOwner(sb: DbClient, owner: OwnerContext) {
  const [reports, messages, attempts] = await Promise.all([
    countForEmail(sb, T.results, owner),
    countForEmail(sb, T.messages, owner),
    countForEmail(sb, T.attemptLogs, owner),
  ]);
  return { reports: reports.count, messages: messages.count, attempts: attempts.count };
}

async function buildOwnerDebug(sb: DbClient, owner: OwnerContext, route: string) {
  const email = normalizeEmail(owner.owner_email);
  const phone = owner.owner_phone_num;

  const [connections, reports, messages, attempts, counts] = await Promise.all([
    sb.from(T.connections).select('phone_number, status').ilike('owner_email', email),
    sb.from(T.results).select('id, owner_phone_num, created_date').ilike('owner_email', email)
      .order('created_date', { ascending: false }).limit(3),
    sb.from(T.messages).select('message_id, owner_phone_num, received_at').ilike('owner_email', email)
      .order('received_at', { ascending: false }).limit(3),
    sb.from(T.attemptLogs).select('id, outcome, created_date').ilike('owner_email', email)
      .order('created_date', { ascending: false }).limit(3),
    dbCountsForOwner(sb, owner),
  ]);

  const conn = connections.data?.[0];
  const lines = [
    `API request → email: ${email} · phone: ${phone}`,
    `DB connection → ${conn?.status ?? 'missing'} · ${conn?.phone_number ?? '—'}`,
    `DB row counts for email → reports: ${counts.reports} · messages: ${counts.messages} · attempts: ${counts.attempts}`,
    `SQL filter used → ${ownerFilterDescription(owner)}`,
  ];
  if (counts.reports === 0 && counts.messages === 0) {
    lines.push(`No data for "${email}" — pair WhatsApp with the account that owns the rows (e.g. bensonlok@gmail.com)`);
  }

  return { summary: lines.join('\n'), counts, latest: { reports: reports.data, messages: messages.data, attempts: attempts.data }, route };
}

function buildMeta(
  owner: OwnerContext,
  route: string,
  table: string,
  rowCount: number,
  dbCounts: { reports: number; messages: number; attempts: number },
  queryLog: QueryLog,
) {
  return {
    route,
    owner_email: owner.owner_email,
    owner_phone_num: owner.owner_phone_num,
    table,
    filter: queryLog.filter,
    rows_returned: rowCount,
    rows_in_db_for_email: dbCounts,
    sample_ids: queryLog.sample_ids,
    query_error: queryLog.error,
  };
}

function messageIdsFromBody(body: Record<string, unknown>) {
  const messageId = String(body.message_id ?? '').trim();
  const messageIds = Array.isArray(body.message_ids)
    ? body.message_ids.map((id) => String(id).trim()).filter(Boolean)
    : messageId ? [messageId] : [];
  return messageIds;
}

function wantsDebug(body: Record<string, unknown>) {
  return body.debug === true || body.debug === 'true';
}

async function routeMessages(sb: DbClient, body: Record<string, unknown>, owner: OwnerContext) {
  const limit = parseLimit(body.limit);
  const cursor = String(body.cursor ?? '').trim();
  const filter = ownerFilterDescription(owner);

  let query = forOwner(
    sb.from(T.messages).select(
      'id, message_id, event_type, received_at, whatsapp_timestamp, from_me, chat_jid, is_group, sender_phone, cleaned_sender_pn, participant, cleaned_participant_pn, message_body, content_type, has_media, media_processing_status, created_date',
    ),
    owner,
  )
    .order('received_at', { ascending: false })
    .limit(limit);

  if (cursor) query = query.lt('received_at', cursor);

  const [{ data, error: qErr }, dbCounts] = await Promise.all([
    query,
    dbCountsForOwner(sb, owner),
  ]);

  const rows = data ?? [];
  const qLog: QueryLog = {
    table: T.messages,
    filter,
    row_count: rows.length,
    error: qErr?.message ?? null,
    sample_ids: sampleIds(rows),
  };
  logQuery(qLog, owner, '/messages');
  if (qErr) return error(qErr.message, 500);

  const nextCursor = rows.length === limit && rows.length > 0 ? rows[rows.length - 1].received_at : null;

  return json({
    messages: rows,
    next_cursor: nextCursor,
    count: rows.length,
    _meta: buildMeta(owner, '/messages', T.messages, rows.length, dbCounts, qLog),
    ...(wantsDebug(body) ? { _debug: await buildOwnerDebug(sb, owner, '/messages') } : {}),
  });
}

async function routeMessagesMedia(sb: DbClient, body: Record<string, unknown>, owner: OwnerContext) {
  const messageIds = messageIdsFromBody(body);
  if (!messageIds.length) return error('message_id or message_ids required');
  if (messageIds.length > MAX_LIMIT) return error(`message_ids max ${MAX_LIMIT}`);

  const { data, error: qErr } = await forOwner(
    sb.from(T.messageMedia).select(
      'id, message_id, media_kind, mime_type, file_name, file_size, caption, storage_url, decrypt_status, created_date',
    ),
    owner,
  ).in('message_id', messageIds);

  if (qErr) return error(qErr.message, 500);
  return json({ media: data ?? [], message_ids: messageIds });
}

async function routeMessagesInterpretations(sb: DbClient, body: Record<string, unknown>, owner: OwnerContext) {
  const messageIds = messageIdsFromBody(body);
  if (!messageIds.length) return error('message_id or message_ids required');
  if (messageIds.length > MAX_LIMIT) return error(`message_ids max ${MAX_LIMIT}`);

  const { data, error: qErr } = await forOwner(
    sb.from(T.interpretations).select(
      'id, message_id, media_id, interpretation_type, content, status, model_name, created_date',
    ),
    owner,
  ).in('message_id', messageIds);

  if (qErr) return error(qErr.message, 500);
  return json({ interpretations: data ?? [], message_ids: messageIds });
}

async function routeThinking(sb: DbClient, body: Record<string, unknown>, owner: OwnerContext) {
  const limit = parseLimit(body.limit);
  const outcome = String(body.outcome ?? '').trim();
  const filter = ownerFilterDescription(owner) + (outcome ? ` AND outcome = '${outcome}'` : '');

  let query = forOwner(
    sb.from(T.attemptLogs).select(
      'id, monitor_setting_id, monitor_name, matched_slot_at, window_start, window_end, relevance_score, score_threshold, passes_threshold, score_reason, score_insights, message_count, outcome, monitor_result_id, created_date',
    ),
    owner,
  )
    .order('created_date', { ascending: false })
    .limit(limit);

  if (outcome) query = query.eq('outcome', outcome);

  const [{ data, error: qErr }, dbCounts] = await Promise.all([query, dbCountsForOwner(sb, owner)]);
  const rows = data ?? [];
  const qLog: QueryLog = {
    table: T.attemptLogs,
    filter,
    row_count: rows.length,
    error: qErr?.message ?? null,
    sample_ids: sampleIds(rows),
  };
  logQuery(qLog, owner, '/thinking');
  if (qErr) return error(qErr.message, 500);

  return json({
    attempts: rows,
    count: rows.length,
    _meta: buildMeta(owner, '/thinking', T.attemptLogs, rows.length, dbCounts, qLog),
    ...(wantsDebug(body) ? { _debug: await buildOwnerDebug(sb, owner, '/thinking') } : {}),
  });
}

async function routeThinkingDetail(sb: DbClient, body: Record<string, unknown>, owner: OwnerContext) {
  const attemptId = String(body.attempt_id ?? body.id ?? '').trim();
  if (!attemptId) return error('attempt_id required');

  const { data: attempt, error: qErr } = await forOwner(
    sb.from(T.attemptLogs).select('*'),
    owner,
  )
    .eq('id', attemptId)
    .maybeSingle();

  if (qErr) return error(qErr.message, 500);
  if (!attempt) return error('Attempt not found', 404);

  let linked_report = null;
  if (attempt.monitor_result_id) {
    const { data: report } = await forOwner(
      sb.from(T.results).select('id, monitor_setting_id, actual_results, created_date'),
      owner,
    )
      .eq('id', attempt.monitor_result_id)
      .maybeSingle();
    linked_report = report;
  }

  return json({ attempt, linked_report });
}

async function routeReports(sb: DbClient, body: Record<string, unknown>, owner: OwnerContext) {
  const limit = parseLimit(body.limit);
  const includePreview = body.include_preview === true;
  const filter = ownerFilterDescription(owner);

  const select = includePreview
    ? 'id, monitor_setting_id, actual_results, created_date'
    : 'id, monitor_setting_id, created_date';

  const [{ data, error: qErr }, dbCounts] = await Promise.all([
    forOwner(sb.from(T.results).select(select), owner)
      .order('created_date', { ascending: false })
      .limit(limit),
    dbCountsForOwner(sb, owner),
  ]);

  const raw = data ?? [];
  const qLog: QueryLog = {
    table: T.results,
    filter,
    row_count: raw.length,
    error: qErr?.message ?? null,
    sample_ids: sampleIds(raw),
  };
  logQuery(qLog, owner, '/reports');
  if (qErr) return error(qErr.message, 500);

  const reports = raw.map((row: Record<string, unknown>) => {
    if (!includePreview || !row.actual_results) return row;
    return { ...row, preview: String(row.actual_results).slice(0, 200) };
  });

  return json({
    reports,
    count: reports.length,
    _meta: buildMeta(owner, '/reports', T.results, reports.length, dbCounts, qLog),
    ...(wantsDebug(body) ? { _debug: await buildOwnerDebug(sb, owner, '/reports') } : {}),
  });
}

async function routeReportsDetail(sb: DbClient, body: Record<string, unknown>, owner: OwnerContext) {
  const reportId = String(body.report_id ?? body.id ?? '').trim();
  if (!reportId) return error('report_id required');

  const { data: report, error: qErr } = await forOwner(
    sb.from(T.results).select('*'),
    owner,
  )
    .eq('id', reportId)
    .maybeSingle();

  if (qErr) return error(qErr.message, 500);
  if (!report) return error('Report not found', 404);

  const { data: linked_attempts } = await forOwner(
    sb.from(T.attemptLogs).select(
      'id, monitor_name, relevance_score, score_threshold, passes_threshold, score_reason, outcome, window_start, window_end, created_date',
    ),
    owner,
  )
    .eq('monitor_result_id', reportId)
    .order('created_date', { ascending: false })
    .limit(5);

  return json({ report, linked_attempts: linked_attempts ?? [] });
}

/**
 * One call — full rows, filtered by owner_phone_num on paired device.
 * Media rows include nested interpretations linked by media_id.
 */
async function routeBundle(sb: DbClient, _body: Record<string, unknown>, owner: OwnerContext) {
  const phone = owner.owner_phone_num;
  const filter = phoneFilterDescription(phone);

  logLine('routeBundle', { phone, filter });

  const [textRes, mediaRes, attemptsRes, reportsRes] = await Promise.all([
    forPhone(sb.from(T.messages).select('*'), phone).order('received_at', { ascending: false }),
    forPhone(sb.from(T.messageMedia).select('*'), phone).order('created_date', { ascending: false }),
    forPhone(sb.from(T.attemptLogs).select('*'), phone).order('created_date', { ascending: false }),
    forPhone(sb.from(T.results).select('*'), phone).order('created_date', { ascending: false }),
  ]);

  const errors = [textRes, mediaRes, attemptsRes, reportsRes]
    .map((r) => r.error?.message)
    .filter(Boolean);
  if (errors.length) {
    logLine('routeBundle errors', { errors });
    return error(errors.join('; '), 500);
  }

  const mediaRows = mediaRes.data ?? [];
  const mediaIds = mediaRows.map((m: { id: string }) => m.id).filter(Boolean);

  let interpretationRows: Record<string, unknown>[] = [];
  if (mediaIds.length) {
    const interpRes = await sb.from(T.interpretations).select('*').in('media_id', mediaIds)
      .order('created_date', { ascending: false });
    if (interpRes.error) return error(interpRes.error.message, 500);
    interpretationRows = interpRes.data ?? [];
  }

  const interpByMediaId: Record<string, Record<string, unknown>[]> = {};
  for (const row of interpretationRows) {
    const mid = String(row.media_id ?? '');
    if (!interpByMediaId[mid]) interpByMediaId[mid] = [];
    interpByMediaId[mid].push(row);
  }

  const media = mediaRows.map((row: Record<string, unknown>) => ({
    ...row,
    interpretations: interpByMediaId[String(row.id ?? '')] ?? [],
  }));

  const text_messages = textRes.data ?? [];
  const attempt_logs = attemptsRes.data ?? [];
  const monitor_results = reportsRes.data ?? [];

  logLine('routeBundle result', {
    phone,
    text_messages: text_messages.length,
    media: media.length,
    interpretations: interpretationRows.length,
    attempt_logs: attempt_logs.length,
    monitor_results: monitor_results.length,
  });

  return json({
    text_messages,
    media,
    attempt_logs,
    monitor_results,
    counts: {
      text_messages: text_messages.length,
      media: media.length,
      interpretations: interpretationRows.length,
      attempt_logs: attempt_logs.length,
      monitor_results: monitor_results.length,
    },
    _meta: {
      filter,
      owner_email: owner.owner_email,
      owner_phone_num: phone,
      tables: {
        text: 'actionnow.whatsapp_messages',
        media: 'actionnow.whatsapp_message_media',
        interpretations: 'actionnow.whatsapp_media_interpretations',
        thinking: 'actionnow.monitor_attempt_logs',
        reports: 'actionnow.monitor_results',
      },
    },
  });
}

function resolveRoute(pathname: string, body: Record<string, unknown>) {
  const fromPath = getRoute(pathname);
  const fromBody = String(body.route ?? '').trim();
  if (fromPath !== '/' && fromPath !== '') return fromPath;
  if (fromBody) {
    return fromBody.startsWith('/') ? fromBody : `/${fromBody}`;
  }
  return fromPath;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return error('Method not allowed', 405);
  }

  const body = await parseBody(req);
  const route = resolveRoute(new URL(req.url).pathname, body);

  try {
    const sb = db();
    const owner = await assertConnectedOwner(sb, {
      owner_email: String(body.owner_email ?? ''),
      owner_phone_num: normalizePhone(String(body.owner_phone_num ?? '')),
    });

    switch (route) {
      case '/messages':
        return await routeMessages(sb, body, owner);
      case '/messages/media':
        return await routeMessagesMedia(sb, body, owner);
      case '/messages/interpretations':
        return await routeMessagesInterpretations(sb, body, owner);
      case '/thinking':
        return await routeThinking(sb, body, owner);
      case '/thinking/detail':
        return await routeThinkingDetail(sb, body, owner);
      case '/reports':
        return await routeReports(sb, body, owner);
      case '/reports/detail':
        return await routeReportsDetail(sb, body, owner);
      case '/debug':
        return json({ _debug: await buildOwnerDebug(sb, owner, '/debug') });
      case '/bundle':
        return await routeBundle(sb, body, owner);
      default:
        return error(
          'Unknown route. Use: /bundle (recommended), /messages, /thinking, /reports, /debug',
          404,
        );
    }
  } catch (err) {
    if (err instanceof Response) return err;
    console.error(err);
    return error(err instanceof Error ? err.message : 'Internal error', 500);
  }
});
