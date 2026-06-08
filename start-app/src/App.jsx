import { useState } from 'react';
import Navbar from './components/Navbar';
import ConfigPanel from './components/ConfigPanel';
import StatusPanel from './components/StatusPanel';
import WhatsAppPairingPanel from './components/WhatsAppPairingPanel';
import Footer from './components/Footer';
import useMouseRipple from './hooks/useMouseRipple';
import { TOAST_VISIBLE_MS } from './lib/main';
import { getDatetimeLocalNow } from './utils/format';

const INITIAL_CONFIG = {
  supervisionLabel: '',
  groups: [],
  fromContacts: [],
  bossNumbers: [{ value: '', verified: false }],
  keywords: ['deadline', 'urgent', 'Q4 report', '@boss'],
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
  ownerEmail: '',
  ownerPhone: '',
  deviceName: '',
  status: 'idle',
  wasenderSessionId: null,
};

function App() {
  useMouseRipple();

  const [config, setConfig] = useState(INITIAL_CONFIG);
  const [owner, setOwner] = useState(INITIAL_OWNER);

  const showSaveToast = () => {
    setConfig((prev) => ({ ...prev, showToast: true, lastChecked: 'Just now' }));
    setTimeout(() => {
      setConfig((prev) => ({ ...prev, showToast: false }));
    }, TOAST_VISIBLE_MS);
  };

  return (
    <div className="font-sans antialiased text-gray-800 bg-white overflow-x-hidden min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <section id="demo" className="py-20 sm:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <WhatsAppPairingPanel onOwnerChange={setOwner} />

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
                ownerEmail={owner.ownerEmail}
                ownerPhone={owner.ownerPhone}
                isWhatsAppConnected={owner.status === 'connected'}
              />
              <StatusPanel
                config={config}
                ownerEmail={owner.ownerEmail}
                ownerPhone={owner.ownerPhone}
              />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default App;
