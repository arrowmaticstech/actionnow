import { getConnection, listWhatsAppSessions, normalizePhoneNumber } from '../api/wasender';
import { DEFAULT_OWNER_EMAIL, resolveOwnerEmail } from './main';

export const PAIRING_STORAGE_KEY = 'actionnow_whatsapp_pairing';

export function loadSavedPairingIdentity() {
  try {
    const raw = localStorage.getItem(PAIRING_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.phoneNumber) return null;
    return { ...parsed, ownerEmail: resolveOwnerEmail() };
  } catch {
    return null;
  }
}

function sessionPhone(session) {
  return normalizePhoneNumber(session?.phone_number ?? session?.phoneNumber ?? '');
}

function pickSession(sessions, savedPhone) {
  if (!sessions.length) return null;
  if (savedPhone) {
    const match = sessions.find((s) => sessionPhone(s) === savedPhone);
    if (match) return match;
  }
  const connected = sessions.find((s) => String(s.status ?? '').toLowerCase() === 'connected');
  return connected ?? sessions[0];
}

function ownerFromPhone(fallback) {
  return {
    ownerEmail: resolveOwnerEmail(),
    ownerPhone: normalizePhoneNumber(fallback.ownerPhone),
    deviceName: fallback.deviceName ?? '',
    wasenderSessionId: fallback.wasenderSessionId ?? null,
    status: 'connected',
    connected: true,
  };
}

/**
 * Resolves owner via wasender session list + DB connection (phone-scoped).
 * Returns null if no identity can be resolved.
 */
export async function resolveConnectedOwner() {
  const saved = loadSavedPairingIdentity();
  const savedPhone = saved?.phoneNumber ? normalizePhoneNumber(saved.phoneNumber) : '';
  const ownerEmail = resolveOwnerEmail();

  try {
    const sessions = await listWhatsAppSessions();
    const session = pickSession(sessions, savedPhone);

    if (session) {
      const ownerPhone = sessionPhone(session) || savedPhone;
      const deviceName = session.name ?? saved?.deviceName ?? '';
      const wasenderSessionId = session.id ?? saved?.wasenderSessionId ?? null;
      const sessionStatus = String(session.status ?? '').toLowerCase();

      const fallback = {
        ownerEmail,
        ownerPhone,
        deviceName,
        wasenderSessionId,
      };

      if (sessionStatus === 'connected') {
        if (ownerPhone) {
          try {
            const result = await getConnection({ ownerEmail, phoneNumber: ownerPhone });
            const connection = result?.connection;
            const connStatus = String(connection?.status ?? '').toLowerCase();
            if (result?.found && connStatus === 'connected') {
              return ownerFromPhone({
                ownerPhone: connection.phone_number ?? ownerPhone,
                deviceName: connection.name ?? deviceName,
                wasenderSessionId: connection.wasender_session_id ?? wasenderSessionId,
              });
            }
          } catch {
            // fall through to session-based connected state
          }
        }
        return { ...fallback, status: 'connected', connected: true };
      }

      return {
        ...fallback,
        status: sessionStatus || 'disconnected',
        connected: false,
      };
    }
  } catch (err) {
    console.warn('listWhatsAppSessions failed, falling back to getConnection:', err);
  }

  if (!savedPhone) return null;

  try {
    const result = await getConnection({ ownerEmail, phoneNumber: savedPhone });
    const connection = result?.connection;
    const connStatus = String(connection?.status ?? '').toLowerCase();

    if (!result?.found || connStatus !== 'connected') {
      return {
        ownerEmail,
        ownerPhone: savedPhone,
        deviceName: saved?.deviceName ?? connection?.name ?? '',
        status: connStatus || 'disconnected',
        connected: false,
      };
    }

    return ownerFromPhone({
      ownerPhone: connection.phone_number ?? savedPhone,
      deviceName: saved?.deviceName ?? connection?.name ?? '',
      wasenderSessionId: connection.wasender_session_id ?? saved?.wasenderSessionId ?? null,
    });
  } catch {
    return {
      ownerEmail,
      ownerPhone: savedPhone,
      deviceName: saved?.deviceName ?? '',
      status: 'unknown',
      connected: false,
    };
  }
}
