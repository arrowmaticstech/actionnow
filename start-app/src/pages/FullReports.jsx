import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  Brain,
  Inbox,
  Loader2,
  RefreshCw,
  Send,
  Smartphone,
} from 'lucide-react';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import AgentThinkingSection from '../components/fullReports/AgentThinkingSection';
import ManagerReportsSection from '../components/fullReports/ManagerReportsSection';
import MessagesReceivedSection from '../components/fullReports/MessagesReceivedSection';
import ReportSection from '../components/fullReports/ReportSection';
import { fetchBundle } from '../api/fullReports';
import { resolveConnectedOwner } from '../lib/ownerIdentity';

export default function FullReports() {
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bundle, setBundle] = useState(null);
  const [bundleError, setBundleError] = useState(null);
  const [bundleLoading, setBundleLoading] = useState(false);

  const loadOwner = useCallback(async () => {
    setLoading(true);
    const resolved = await resolveConnectedOwner();
    setOwner(resolved);
    setLoading(false);
    return resolved;
  }, []);

  const loadBundle = useCallback(async (ownerForApi) => {
    if (!ownerForApi) return;
    setBundleLoading(true);
    setBundleError(null);
    try {
      setBundle(await fetchBundle(ownerForApi));
    } catch (err) {
      setBundle(null);
      setBundleError(err.message);
    } finally {
      setBundleLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOwner();
  }, [loadOwner]);

  const ownerForApi = owner?.connected
    ? { ownerEmail: owner.ownerEmail, ownerPhone: owner.ownerPhone }
    : null;

  useEffect(() => {
    if (ownerForApi) loadBundle(ownerForApi);
    else setBundle(null);
  }, [ownerForApi?.ownerEmail, ownerForApi?.ownerPhone, loadBundle]);

  const handleRefresh = async () => {
    const resolved = await loadOwner();
    if (resolved?.connected) {
      await loadBundle({
        ownerEmail: resolved.ownerEmail,
        ownerPhone: resolved.ownerPhone,
      });
    }
  };

  const c = bundle?.counts;

  return (
    <div className="font-sans antialiased text-gray-800 bg-white min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-wa-dark">
              <ArrowLeft className="w-4 h-4" />
              Back to dashboard
            </Link>
            {owner?.connected && (
              <button
                type="button"
                onClick={handleRefresh}
                disabled={bundleLoading}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-wa-green disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${bundleLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            )}
          </div>

          <header className="mb-12">
            <p className="text-wa-green font-semibold text-sm tracking-wider uppercase">Activity log</p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-2">Full Reports</h1>
            <p className="text-gray-500 mt-2 text-sm">Raw DB rows · filtered by paired <code>owner_phone_num</code></p>
          </header>

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-24 text-gray-500">
              <Loader2 className="w-5 h-5 animate-spin" />
              Checking paired device…
            </div>
          ) : !owner?.connected ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-900">Pair WhatsApp first</p>
                <Link to="/#demo" className="inline-block mt-3 text-sm font-semibold text-wa-dark hover:underline">
                  Go to pairing →
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-8 rounded-xl border border-gray-200 bg-wa-gray/50 px-4 py-3 flex items-start gap-3">
                <Smartphone className="w-5 h-5 text-wa-green flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-gray-800">Filter phone</p>
                  <p className="text-gray-600 font-mono">{owner.ownerPhone}</p>
                  {c && (
                    <p className="text-xs text-gray-400 mt-1">
                      {c.text_messages} text · {c.media} media · {c.interpretations} interpretations ·{' '}
                      {c.attempt_logs} attempts · {c.monitor_results} reports
                    </p>
                  )}
                  {bundle?._meta?.filter && (
                    <p className="text-xs text-gray-400 mt-0.5 font-mono">{bundle._meta.filter}</p>
                  )}
                </div>
              </div>

              {bundleError && (
                <div className="mb-8 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {bundleError}
                </div>
              )}

              {bundleLoading && !bundle ? (
                <div className="flex justify-center py-24 text-gray-500 gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Loading…
                </div>
              ) : (
                <div className="space-y-20">
                  <ReportSection
                    id="messages-received"
                    title="Messages Received"
                    subtitle="whatsapp_messages (text) + whatsapp_message_media with interpretations by media_id"
                    icon={Inbox}
                  >
                    <MessagesReceivedSection
                      textMessages={bundle?.text_messages}
                      media={bundle?.media}
                    />
                  </ReportSection>

                  <ReportSection
                    id="manager-thinking"
                    title="Manager Agent Thinking"
                    subtitle="monitor_attempt_logs — all columns"
                    icon={Brain}
                  >
                    <AgentThinkingSection attemptLogs={bundle?.attempt_logs} />
                  </ReportSection>

                  <ReportSection
                    id="manager-reports"
                    title="Manager Reports"
                    subtitle="monitor_results — all columns"
                    icon={Send}
                  >
                    <ManagerReportsSection monitorResults={bundle?.monitor_results} />
                  </ReportSection>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
