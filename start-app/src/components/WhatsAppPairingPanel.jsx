import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import QRCodePkg from 'react-qr-code';

const QRCode = QRCodePkg?.default ?? QRCodePkg?.QRCode ?? QRCodePkg;
import {
  Link2, Mail, Phone, Smartphone, Loader2, Unlink, CheckCircle2,
  AlertCircle, RefreshCw, QrCode,
} from 'lucide-react';
import {
  createAndPair,
  pollStatus,
  unbindConnection,
  getConnection,
  syncConnection,
  listWhatsAppSessions,
  deleteWhatsAppSession,
  normalizePhoneNumber,
  extractPairingQr,
  QR_TTL_SECONDS,
  STATUS_POLL_MS,
} from '../api/wasender';
import { DEFAULT_OWNER_EMAIL, resolveOwnerEmail } from '../lib/main';
import { PAGE_RELOAD_AFTER_UNBIND_MS } from '../utils/pairingRecovery';

const OWNER_EMAIL = DEFAULT_OWNER_EMAIL;

function PairingQrDisplay({ value }) {
  if (!value) return null;
  if (value.startsWith('data:image')) {
    return (
      <img
        src={value}
        alt="WhatsApp pairing QR code"
        className="w-48 h-48 rounded-lg border border-gray-100"
      />
    );
  }
  return (
    <div className="bg-white p-3 rounded-lg border border-gray-100">
      <QRCode value={value} size={192} />
    </div>
  );
}

const STORAGE_KEY = 'actionnow_whatsapp_pairing';

function loadSavedIdentity() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.phoneNumber) return null;
    return { ...parsed, ownerEmail: OWNER_EMAIL };
  } catch {
    return null;
  }
}

function saveIdentity(identity) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    ...identity,
    ownerEmail: OWNER_EMAIL,
  }));
}

function clearIdentity() {
  localStorage.removeItem(STORAGE_KEY);
}

const WhatsAppPairingPanel = forwardRef(function WhatsAppPairingPanel({ onOwnerChange }, ref) {
  const saved = loadSavedIdentity();

  const [phoneNumber, setPhoneNumber] = useState(saved?.phoneNumber ?? '');
  const [deviceName, setDeviceName] = useState(saved?.deviceName ?? '');
  const [status, setStatus] = useState('idle');
  const [qrCode, setQrCode] = useState(null);
  const [qrSecondsLeft, setQrSecondsLeft] = useState(0);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [sessionId, setSessionId] = useState(saved?.wasenderSessionId ?? null);
  const panelRef = useRef(null);
  const pollRef = useRef(null);
  const qrTimerRef = useRef(null);
  const loadedSessionRef = useRef(null);

  const notifyOwner = useCallback((next) => {
    onOwnerChange?.({
      ownerEmail: resolveOwnerEmail(),
      ownerPhone: normalizePhoneNumber(next.phoneNumber),
      deviceName: next.deviceName,
      status: next.status,
      wasenderSessionId: next.sessionId ?? null,
    });
  }, [onOwnerChange]);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const stopQrTimer = useCallback(() => {
    if (qrTimerRef.current) {
      clearInterval(qrTimerRef.current);
      qrTimerRef.current = null;
    }
  }, []);

  const applyConnected = useCallback(async (identity) => {
    stopPolling();
    stopQrTimer();
    setQrCode(null);
    setQrSecondsLeft(0);
    setStatus('connected');
    setError(null);

    const phone = normalizePhoneNumber(identity.phoneNumber ?? '');
    if (phone) {
      try {
        await syncConnection({
          ownerEmail: OWNER_EMAIL,
          phoneNumber: phone,
          whatsappSession: identity.sessionId,
        });
      } catch (err) {
        console.warn('DB sync after connect failed (will retry on first fetch):', err);
      }
    }

    saveIdentity(identity);
    notifyOwner({ ...identity, status: 'connected' });
  }, [notifyOwner, stopPolling, stopQrTimer]);

  const startQrCountdown = useCallback(() => {
    stopQrTimer();
    setQrSecondsLeft(QR_TTL_SECONDS);
    qrTimerRef.current = setInterval(() => {
      setQrSecondsLeft((prev) => {
        if (prev <= 1) {
          stopQrTimer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [stopQrTimer]);

  const startStatusPolling = useCallback((identity) => {
    stopPolling();
    pollRef.current = setInterval(async () => {
      try {
        const result = await pollStatus({
          ownerEmail: identity.ownerEmail,
          phoneNumber: identity.phoneNumber,
          whatsappSession: identity.sessionId,
        });
        if (result.connected || result.status === 'connected') {
          applyConnected(identity);
        }
      } catch (err) {
        console.error('Poll status failed:', err);
      }
    }, STATUS_POLL_MS);
  }, [applyConnected, stopPolling]);

  const beginPairing = useCallback(async (identity, { isRefresh = false, replaceExisting = false } = {}) => {
    setBusy(true);
    setError(null);

    try {
      const existingId = identity.sessionId ?? sessionId ?? loadedSessionRef.current?.id ?? null;

      if (replaceExisting && existingId) {
        try {
          await deleteWhatsAppSession(existingId);
        } catch (deleteErr) {
          console.warn('Failed to delete existing session:', deleteErr);
        }
        loadedSessionRef.current = null;
        setSessionId(null);
      }

      const result = await createAndPair({
        ownerEmail: identity.ownerEmail,
        phoneNumber: identity.phoneNumber,
        name: identity.deviceName,
      });

      const nextSessionId = result.wasender_session_id ?? result.connection?.wasender_session_id ?? null;
      const fullIdentity = { ...identity, sessionId: nextSessionId };
      setSessionId(nextSessionId);
      saveIdentity(fullIdentity);

      if (result.already_connected || result.status === 'connected') {
        applyConnected(fullIdentity);
        return;
      }

      const code = extractPairingQr(result);
      if (!code) {
        throw new Error('No QR code returned. Try again.');
      }

      setStatus('pending');
      setQrCode(code);
      startQrCountdown();
      startStatusPolling(fullIdentity);
      notifyOwner({ ...fullIdentity, status: 'pending' });

      if (isRefresh) {
        setError(null);
      }
    } catch (err) {
      setError(err.message || 'Failed to start pairing');
      setStatus('error');
    } finally {
      setBusy(false);
    }
  }, [applyConnected, notifyOwner, sessionId, startQrCountdown, startStatusPolling]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const phone = phoneNumber.trim();
    const name = deviceName.trim() || 'WhatsApp Device';

    if (!phone) {
      setError('Phone number is required.');
      return;
    }

    const hasExisting = !!(sessionId || loadedSessionRef.current?.id);
    beginPairing(
      { ownerEmail: OWNER_EMAIL, phoneNumber: phone, deviceName: name, sessionId },
      { replaceExisting: hasExisting },
    );
  };

  const handleRefreshQr = () => {
    const phone = phoneNumber.trim();
    const name = deviceName.trim() || 'WhatsApp Device';
    if (!phone) return;
    beginPairing(
      { ownerEmail: OWNER_EMAIL, phoneNumber: phone, deviceName: name, sessionId },
      { isRefresh: true },
    );
  };

  const resetLocalPairingState = useCallback((phone, name) => {
    setStatus('disconnected');
    setQrCode(null);
    setQrSecondsLeft(0);
    setSessionId(null);
    loadedSessionRef.current = null;
    clearIdentity();
    notifyOwner({
      ownerEmail: OWNER_EMAIL,
      phoneNumber: phone,
      deviceName: name,
      status: 'disconnected',
      sessionId: null,
    });
  }, [notifyOwner]);

  const performUnbind = useCallback(async ({ skipConfirm = false } = {}) => {
    const phone = phoneNumber.trim();
    const name = deviceName.trim() || 'WhatsApp Device';

    if (!phone) {
      resetLocalPairingState(phone, name);
      return;
    }

    if (
      !skipConfirm
      && !window.confirm('Disconnect this WhatsApp device? You will need to scan a new QR code to pair again.')
    ) {
      return;
    }

    setBusy(true);
    setError(null);
    stopPolling();
    stopQrTimer();

    try {
      await unbindConnection({
        ownerEmail: OWNER_EMAIL,
        phoneNumber: phone,
        whatsappSession: sessionId,
      });
      resetLocalPairingState(phone, name);
    } catch (err) {
      if (skipConfirm) {
        console.warn('Recovery unbind API failed — clearing local pairing state:', err);
        resetLocalPairingState(phone, name);
      } else {
        setError(err.message || 'Failed to unbind');
      }
    } finally {
      setBusy(false);
    }
  }, [deviceName, phoneNumber, resetLocalPairingState, sessionId, stopPolling, stopQrTimer]);

  const handleUnbind = () => performUnbind({ skipConfirm: false });

  const recoverStalePairing = useCallback(async () => {
    const phone = phoneNumber.trim();

    setBusy(true);
    stopPolling();
    stopQrTimer();

    try {
      if (phone) {
        await unbindConnection({
          ownerEmail: OWNER_EMAIL,
          phoneNumber: phone,
          whatsappSession: sessionId,
        });
      }
    } catch (err) {
      console.warn('Recovery unbind API failed:', err);
    } finally {
      clearIdentity();
      setBusy(false);
    }

    window.setTimeout(() => {
      window.location.reload();
    }, PAGE_RELOAD_AFTER_UNBIND_MS);
  }, [phoneNumber, sessionId, stopPolling, stopQrTimer]);

  useImperativeHandle(ref, () => ({ recoverStalePairing }), [recoverStalePairing]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const sessions = await listWhatsAppSessions();
        if (cancelled) return;

        const top = sessions[0];
        if (top) {
          loadedSessionRef.current = top;
          const sessionStatus = String(top.status ?? '').toLowerCase();
          const phone = top.phone_number ?? saved?.phoneNumber ?? '';
          const name = top.name ?? saved?.deviceName ?? '';
          const id = top.id ?? null;

          setPhoneNumber(phone);
          setDeviceName(name);
          setSessionId(id);

          const identity = {
            ownerEmail: OWNER_EMAIL,
            phoneNumber: phone,
            deviceName: name,
            sessionId: id,
          };

          if (sessionStatus === 'connected') {
            applyConnected(identity);
          } else {
            setStatus(sessionStatus || 'disconnected');
            notifyOwner({ ...identity, status: sessionStatus || 'disconnected' });
          }
          return;
        }

        const phone = saved?.phoneNumber;
        if (!phone) return;

        const result = await getConnection({ ownerEmail: OWNER_EMAIL, phoneNumber: phone });
        if (cancelled) return;

        const connection = result.connection;
        const connStatus = String(connection?.status ?? '').toLowerCase();

        if (result.found && connStatus === 'connected') {
          const identity = {
            ownerEmail: OWNER_EMAIL,
            phoneNumber: phone,
            deviceName: connection.name ?? saved.deviceName ?? '',
            sessionId: connection.wasender_session_id ?? null,
          };
          setPhoneNumber(phone);
          setDeviceName(identity.deviceName);
          setSessionId(identity.sessionId);
          if (identity.sessionId) {
            loadedSessionRef.current = { id: identity.sessionId, status: 'connected' };
          }
          applyConnected(identity);
        } else if (result.found) {
          setStatus(connStatus || 'disconnected');
          notifyOwner({
            ownerEmail: OWNER_EMAIL,
            phoneNumber: phone,
            deviceName: saved.deviceName ?? '',
            status: connStatus || 'disconnected',
            sessionId: connection?.wasender_session_id ?? null,
          });
        }
      } catch (err) {
        console.error('Failed to load sessions:', err);
      } finally {
        if (!cancelled) setInitialLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => {
    stopPolling();
    stopQrTimer();
  }, [stopPolling, stopQrTimer]);

  const isConnected = status === 'connected';
  const showQr = status === 'pending' && qrCode;
  const qrExpired = showQr && qrSecondsLeft === 0;
  const canUnbind = isConnected || status === 'pending' || sessionId;

  if (initialLoading) {
    return (
      <div className="w-full mb-10 rounded-2xl border border-wa-green/20 bg-gradient-to-r from-wa-green/5 via-white to-wa-green/5 shadow-sm px-5 py-8 sm:px-8 flex items-center justify-center gap-2 text-sm text-gray-500">
        <Loader2 className="w-4 h-4 animate-spin text-wa-green" />
        Loading WhatsApp sessions…
      </div>
    );
  }

  return (
    <div
      ref={panelRef}
      id="whatsapp-pairing-panel"
      className="w-full mb-10 rounded-2xl border border-wa-green/20 bg-gradient-to-r from-wa-green/5 via-white to-wa-green/5 shadow-sm px-5 py-4 sm:px-8 sm:py-5"
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-wa-green/15 flex items-center justify-center flex-shrink-0">
            <Link2 className="w-5 h-5 text-wa-green" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-wa-green">
              WhatsApp pairing
            </p>
            <p className="text-sm text-gray-500">
              Link your device — reports and monitoring use this account
            </p>
          </div>
        </div>

        {canUnbind && (
          <button
            id="whatsapp-unbind-btn"
            type="button"
            onClick={handleUnbind}
            disabled={busy}
            className="flex-shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
          >
            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Unlink className="w-3.5 h-3.5" />}
            Unbind
          </button>
        )}
      </div>

      {isConnected ? (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8 text-sm bg-wa-green/10 rounded-xl px-4 py-3 border border-wa-green/20">
          <div className="flex items-center gap-2 text-wa-green font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            Connected
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="font-medium text-gray-800 truncate">{OWNER_EMAIL}</span>
          </div>
          <div className="hidden sm:block w-px h-5 bg-wa-green/20" aria-hidden="true" />
          <div className="flex items-center gap-2 min-w-0">
            <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="font-medium text-gray-800 truncate">{normalizePhoneNumber(phoneNumber)}</span>
          </div>
          {deviceName && (
            <>
              <div className="hidden sm:block w-px h-5 bg-wa-green/20" aria-hidden="true" />
              <div className="flex items-center gap-2 min-w-0 text-gray-600">
                <Smartphone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="truncate">{deviceName}</span>
              </div>
            </>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-xs text-gray-500">
            Account email: <span className="font-mono text-gray-700">{OWNER_EMAIL}</span>
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="pair-phone" className="block text-xs font-semibold text-gray-600 mb-1.5">
                Phone number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="pair-phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+60123456789"
                  required
                  disabled={busy || status === 'pending'}
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-wa-green focus:border-wa-green focus:outline-none disabled:bg-gray-50"
                />
              </div>
            </div>
            <div>
              <label htmlFor="pair-device" className="block text-xs font-semibold text-gray-600 mb-1.5">
                Device name
              </label>
              <div className="relative">
                <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="pair-device"
                  type="text"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  placeholder="e.g. Ops WhatsApp"
                  disabled={busy || status === 'pending'}
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-wa-green focus:border-wa-green focus:outline-none disabled:bg-gray-50"
                />
              </div>
            </div>
          </div>

          {!showQr && (
            <button
              type="submit"
              disabled={busy}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-wa-green text-white text-sm font-semibold rounded-lg hover:bg-wa-green/90 transition-colors disabled:opacity-70"
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <QrCode className="w-4 h-4" />}
              {busy ? 'Preparing…' : 'Generate QR & Pair'}
            </button>
          )}

          {showQr && (
            <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-white rounded-xl border border-gray-200">
              <div className="relative">
                <PairingQrDisplay value={qrCode} />
                {qrSecondsLeft > 0 && (
                  <span className="absolute -top-2 -right-2 bg-wa-green text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {qrSecondsLeft}s
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-600 space-y-3 max-w-xs w-full">
                <p className="font-semibold text-gray-800">Scan with WhatsApp</p>
                <p>Open WhatsApp → Linked devices → Link a device → scan this code.</p>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-medium text-gray-500">
                    <span>QR expires in</span>
                    <span className={qrExpired ? 'text-red-600' : 'text-wa-green'}>
                      {qrExpired ? 'Expired' : `${qrSecondsLeft}s`}
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-1000 ease-linear ${qrExpired ? 'bg-red-400 w-0' : 'bg-wa-green'}`}
                      style={{ width: qrExpired ? '0%' : `${(qrSecondsLeft / QR_TTL_SECONDS) * 100}%` }}
                    />
                  </div>
                </div>
                {qrExpired ? (
                  <button
                    type="button"
                    onClick={handleRefreshQr}
                    disabled={busy}
                    className="inline-flex items-center gap-1.5 text-wa-green font-semibold hover:underline disabled:opacity-50"
                  >
                    <RefreshCw className="w-4 h-4" />
                    QR expired — refresh
                  </button>
                ) : (
                  <p className="flex items-center gap-1.5 text-gray-400">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Waiting for scan…
                  </p>
                )}
              </div>
            </div>
          )}
        </form>
      )}

      {error && (
        <div className="mt-3 flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
});

export default WhatsAppPairingPanel;
