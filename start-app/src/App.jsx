import { useState } from 'react';
import Navbar from './components/Navbar';
import ConfigPanel from './components/ConfigPanel';
import StatusPanel from './components/StatusPanel';
import Footer from './components/Footer';
import useMouseRipple from './hooks/useMouseRipple';
import { Mail, Phone, Link2 } from 'lucide-react';
import { TOAST_VISIBLE_MS, DEFAULT_OWNER_EMAIL, DEFAULT_OWNER_PHONE } from './lib/main';

const INITIAL_CONFIG = {
  supervisionLabel: '',
  groups: [],
  fromContacts: [],
  bossNumbers: [{ value: '', verified: false }],
  keywords: ['deadline', 'urgent', 'Q4 report', '@boss'],
  contentTypes: {
    text: true,
    audio: true,
    images: true,
    documents: false,
  },
  startTime: '',
  endTime: '',
  interval: '15',
  lastChecked: 'Just now',
  showToast: false,
};

function App() {
  useMouseRipple();

  const [config, setConfig] = useState(INITIAL_CONFIG);

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
            <div className="w-full mb-10 rounded-2xl border border-wa-green/20 bg-gradient-to-r from-wa-green/5 via-white to-wa-green/5 shadow-sm px-5 py-4 sm:px-8 sm:py-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-wa-green/15 flex items-center justify-center flex-shrink-0">
                    <Link2 className="w-5 h-5 text-wa-green" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-wa-green">
                      Connected account
                    </p>
                    <p className="text-sm text-gray-500">
                      Reports and monitoring are tied to this owner
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8 text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="font-medium text-gray-800 truncate" title={DEFAULT_OWNER_EMAIL}>
                      {DEFAULT_OWNER_EMAIL}
                    </span>
                  </div>
                  <div className="hidden sm:block w-px h-5 bg-gray-200" aria-hidden="true" />
                  <div className="flex items-center gap-2 min-w-0">
                    <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="font-medium text-gray-800 truncate" title={DEFAULT_OWNER_PHONE}>
                      {DEFAULT_OWNER_PHONE}
                    </span>
                  </div>
                </div>
              </div>
            </div>

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
              <ConfigPanel config={config} setConfig={setConfig} onSave={showSaveToast} />
              <StatusPanel config={config} />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default App;
