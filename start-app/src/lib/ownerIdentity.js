import { getConnection, normalizePhoneNumber } from '../api/wasender';

export const PAIRING_STORAGE_KEY = 'actionnow_whatsapp_pairing';

export function loadSavedPairingIdentity() {
  try {
    const raw = localStorage.getItem(PAIRING_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.ownerEmail) return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Resolves owner from local pairing storage and verifies WhatsApp is connected in DB.
 * Returns null if no saved identity or device is not connected.
 */
export async function resolveConnectedOwner() {
  const saved = loadSavedPairingIdentity();
  if (!saved?.ownerEmail || !saved?.phoneNumber) return null;

  const ownerEmail = String(saved.ownerEmail).trim();
  const ownerPhone = normalizePhoneNumber(saved.phoneNumber);

  try {
    const result = await getConnection({ ownerEmail, phoneNumber: ownerPhone });
    const connection = result?.connection;
    const connStatus = String(connection?.status ?? '').toLowerCase();

    if (!result?.found || connStatus !== 'connected') {
      return {
        ownerEmail,
        ownerPhone,
        deviceName: saved.deviceName ?? connection?.name ?? '',
        status: connStatus || 'disconnected',
        connected: false,
      };
    }

    return {
      ownerEmail: connection.owner_email ?? ownerEmail,
      ownerPhone: normalizePhoneNumber(connection.phone_number ?? ownerPhone),
      deviceName: connection.name ?? saved.deviceName ?? '',
      wasenderSessionId: connection.wasender_session_id ?? saved.wasenderSessionId ?? null,
      status: 'connected',
      connected: true,
    };
  } catch {
    return {
      ownerEmail,
      ownerPhone,
      deviceName: saved.deviceName ?? '',
      status: 'unknown',
      connected: false,
    };
  }
}
