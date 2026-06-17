import { useCallback, useEffect, useRef, useState } from 'react';
import ConfigPanel from '../components/ConfigPanel';
import StatusPanel from '../components/StatusPanel';
import WhatsAppPairingPanel from '../components/WhatsAppPairingPanel';
import AppToast from '../components/AppToast';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import useMouseRipple from '../hooks/useMouseRipple';
import { fetchMonitorConfig } from '../api/fullReports';
import { mapDbConfigToUi } from '../api/start';
import { DEFAULT_OWNER_EMAIL, TOAST_VISIBLE_MS } from '../lib/main';
import {
  DEFAULT_COMMON_SUBOPTIONS,
  DEFAULT_INSTRUCTIONS_PROMPT,
  PREFERRED_METHODS,
} from '../lib/monitoringMethods';
import { getDatetimeLocalNow } from '../utils/format';

const INITIAL_CONFIG = {
  supervisionLabel: '',
  groups: [],
  fromContacts: [],
  bossNumbers: [{ value: '', verified: false }],
  keywords: ['deadline', 'urgent', 'Q4 report', '@boss'],
  preferredMethod: PREFERRED_METHODS.KEYWORD,
  insightsSuboptions: [...DEFAULT_COMMON_SUBOPTIONS],
  promptInstructionsTemplate: DEFAULT_INSTRUCTIONS_PROMPT,
  contentTypes: {
    text: true,
    audio: true,
    image: true,
    document: false,
  },
  startTime: getDatetimeLocalNow(),
  endTime: '',
  interval: '15',
  lastChecked: 'Just now',
  showToast: false,
};

const INITIAL_OWNER = {
  ownerEmail: DEFAULT_OWNER_EMAIL,
  ownerPhone: '',
  deviceName: '',
  status: 'idle',
  wasenderSessionId: null,
};

export default function HomePage() {
  useMouseRipple();

  const [config, setConfig] = useState(INITIAL_CONFIG);
  const [owner, setOwner] = useState(INITIAL_OWNER);
  const [configLoadedFor, setConfigLoadedFor] = useState('');
  const [appToast, setAppToast] = useState({ show: false, title: '', message: '', variant: 'info' });
  const pairingPanelRef = useRef(null);

  useEffect(() => {
    if (owner.status !== 'connected') return;

    const phone = owner.ownerPhone?.trim();
    if (!phone) return;

    const key = `${DEFAULT_OWNER_EMAIL}|${phone}`;
    if (configLoadedFor === key) return;

    let cancelled = false;

    (async () => {
      try {
        const result = await fetchMonitorConfig({ ownerEmail: DEFAULT_OWNER_EMAIL, ownerPhone: phone });
        if (cancelled || !result?.found || !result.config) return;

        setConfig((prev) => ({
          ...mapDbConfigToUi(result.config, prev),
          lastChecked: 'Loaded from server',
        }));
        setConfigLoadedFor(key);
      } catch (err) {
        console.warn('Failed to load saved monitor config:', err);
      }
    })();

    return () => { cancelled = true; };
  }, [owner.status, owner.ownerEmail, owner.ownerPhone, configLoadedFor]);

  const showAppToast = useCallback((title, message, options = {}) => {
    const {
      variant = 'info',
      position = 'top',
      hint = '',
      durationMs = TOAST_VISIBLE_MS,
    } = typeof options === 'string' ? { variant: options } : options;

    setAppToast({
      show: true,
      title,
      message,
      variant,
      position,
      hint,
    });
    window.setTimeout(() => {
      setAppToast((prev) => ({ ...prev, show: false }));
    }, durationMs);
  }, []);

  const handlePairingRequired = useCallback((message) => {
    showAppToast(
      'Connection not ready',
      message || 'No WhatsApp connection found. Pair your device first.',
      {
        variant: 'warning',
        position: 'center',
        hint: 'Wait a few seconds after scanning the QR, then tap Fetch again.',
        durationMs: 8000,
      },
    );
  }, [showAppToast]);

  const handleListFetchError = useCallback((message, kind = 'timeout') => {
    const isTimeout = kind === 'timeout';
    showAppToast(
      isTimeout ? 'Taking longer than expected' : 'Could not load list',
      message || 'Please try again in a moment.',
      {
        variant: isTimeout ? 'warning' : 'error',
        position: 'center',
        hint: isTimeout ? 'Wasender may be slow — wait a few seconds and tap Fetch again.' : '',
        durationMs: 6000,
      },
    );
  }, [showAppToast]);

  const showSaveToast = () => {
    setConfig((prev) => ({ ...prev, showToast: true, lastChecked: 'Just now' }));
    setTimeout(() => {
      setConfig((prev) => ({ ...prev, showToast: false }));
    }, TOAST_VISIBLE_MS);
  };

  return (
    <div className="font-sans antialiased text-gray-800 bg-white overflow-x-hidden min-h-screen flex flex-col">
      <AppToast toast={appToast} />
      <Navbar />

      <main className="flex-1">
        <section id="demo" className="py-20 sm:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <WhatsAppPairingPanel ref={pairingPanelRef} onOwnerChange={setOwner} />

            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-wa-green font-semibold text-sm tracking-wider uppercase">
                Live Config Demo
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-3">
                Configure Your Agent
              </h2>
              <p className="text-gray-500 mt-4 text-lg">
                See how easy it is to set up your WhatsApp manager. Try the interactive demo below.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-10 items-start">
              <ConfigPanel
                config={config}
                setConfig={setConfig}
                onSave={showSaveToast}
                onPairingRequired={handlePairingRequired}
                onListFetchError={handleListFetchError}
                ownerEmail={owner.ownerEmail}
                ownerPhone={owner.ownerPhone}
                wasenderSessionId={owner.wasenderSessionId}
                isWhatsAppConnected={owner.status === 'connected'}
              />
              <StatusPanel
                config={config}
                ownerEmail={owner.ownerEmail}
                ownerPhone={owner.ownerPhone}
                isWhatsAppConnected={owner.status === 'connected'}
              />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
