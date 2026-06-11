import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  FileText,
  Loader2,
  Printer,
  RefreshCw,
  Smartphone,
} from 'lucide-react';
import { fetchLatestReports } from '../api/start';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import { resolveConnectedOwner } from '../lib/ownerIdentity';
import { markdownToHtml } from '../utils/markdown';

function formatReportTime(iso) {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function FullReports() {
  const [owner, setOwner] = useState(null);
  const [ownerLoading, setOwnerLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const loadOwner = useCallback(async () => {
    setOwnerLoading(true);
    try {
      const resolved = await resolveConnectedOwner();
      setOwner(resolved);
      return resolved;
    } finally {
      setOwnerLoading(false);
    }
  }, []);

  const loadReports = useCallback(async (resolvedOwner) => {
    if (!resolvedOwner?.connected) {
      setReports([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const items = await fetchLatestReports({
        ownerEmail: resolvedOwner.ownerEmail,
        ownerPhone: resolvedOwner.ownerPhone,
        requireOwner: true,
      });
      setReports(items);
    } catch (err) {
      setError(err.message || 'Failed to load reports');
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOwner().then((resolved) => {
      if (resolved?.connected) loadReports(resolved);
    });
  }, [loadOwner, loadReports]);

  const handleRefresh = useCallback(async () => {
    const resolved = await loadOwner();
    if (resolved?.connected) await loadReports(resolved);
  }, [loadOwner, loadReports]);

  const reportRows = useMemo(
    () =>
      reports.map((report) => ({
        ...report,
        html: markdownToHtml(report.markdown),
        preview: String(report.markdown ?? '').slice(0, 160).replace(/\s+/g, ' ').trim(),
      })),
    [reports],
  );

  return (
    <div className="font-sans antialiased text-gray-800 bg-white min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div>
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-wa-dark mb-3"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to dashboard
              </Link>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 flex items-center gap-2">
                <FileText className="w-7 h-7 text-wa-green" />
                Full Reports
              </h1>
              <p className="text-gray-500 mt-2 text-sm sm:text-base">
                All monitor reports from the database for your currently paired WhatsApp device only.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                disabled={!reportRows.length}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-200 rounded-xl hover:bg-wa-gray disabled:opacity-40"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
              <button
                type="button"
                onClick={handleRefresh}
                disabled={ownerLoading || loading}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-wa-dark text-white rounded-xl hover:bg-wa-dark/90 disabled:opacity-50"
              >
                {loading || ownerLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                Refresh
              </button>
            </div>
          </div>

          {ownerLoading ? (
            <div className="flex items-center justify-center gap-2 py-20 text-gray-500">
              <Loader2 className="w-5 h-5 animate-spin" />
              Checking paired device…
            </div>
          ) : !owner?.connected ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-900">No connected WhatsApp device</p>
                <p className="text-sm text-amber-800 mt-1">
                  Reports are only shown for the WhatsApp account paired on this browser.
                  {owner?.ownerEmail ? (
                    <> Last known: {owner.ownerEmail} ({owner.status}).</>
                  ) : (
                    <> Pair your device on the home page first.</>
                  )}
                </p>
                <Link
                  to="/#demo"
                  className="inline-block mt-3 text-sm font-semibold text-wa-dark hover:underline"
                >
                  Go to pairing →
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6 rounded-xl border border-gray-200 bg-wa-gray/60 px-4 py-3 flex items-start gap-3 print:border-gray-300">
                <Smartphone className="w-5 h-5 text-wa-green flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-gray-800">Current device</p>
                  <p className="text-gray-600">
                    {owner.deviceName || 'WhatsApp'} · {owner.ownerEmail} · {owner.ownerPhone}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Showing rows from <code className="text-gray-600">actionnow.monitor_results</code> filtered by this owner.
                  </p>
                </div>
              </div>

              {loading && !reportRows.length ? (
                <div className="flex items-center justify-center gap-2 py-16 text-gray-500">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Loading reports…
                </div>
              ) : error && !reportRows.length ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  {error}
                </div>
              ) : !reportRows.length ? (
                <p className="text-center text-gray-500 py-16">
                  No reports yet for this device.
                </p>
              ) : (
                <div className="space-y-4" id="full-reports-print-root">
                  <div className="hidden print:block mb-6">
                    <h2 className="text-lg font-bold">ActionNow — Full Reports</h2>
                    <p className="text-sm text-gray-600">
                      {owner.ownerEmail} · {owner.ownerPhone} · {reportRows.length} report(s)
                    </p>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-gray-200 print:hidden">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-wa-gray text-xs uppercase text-gray-500">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Generated</th>
                          <th className="px-4 py-3 font-semibold">Preview</th>
                          <th className="px-4 py-3 font-semibold w-24">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {reportRows.map((row) => (
                          <tr key={row.id} className="hover:bg-wa-gray/40">
                            <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                              {formatReportTime(row.createdDate)}
                            </td>
                            <td className="px-4 py-3 text-gray-600 max-w-md truncate" title={row.preview}>
                              {row.preview || '—'}
                            </td>
                            <td className="px-4 py-3">
                              <button
                                type="button"
                                onClick={() => setExpandedId((id) => (id === row.id ? null : row.id))}
                                className="text-wa-dark font-medium hover:underline"
                              >
                                {expandedId === row.id ? 'Hide' : 'View'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <p className="text-xs text-gray-400 print:hidden">
                    {reportRows.length} report{reportRows.length !== 1 ? 's' : ''} (latest 50 from database)
                  </p>

                  {reportRows.map((row) => (
                    <article
                      key={row.id}
                      className={`rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden break-inside-avoid ${
                        expandedId === row.id ? 'block' : 'hidden print:block'
                      }`}
                    >
                      <header className="px-5 py-3 border-b border-gray-100 bg-wa-gray/50 flex justify-between items-center gap-2">
                        <span className="text-sm font-semibold text-gray-800">
                          {formatReportTime(row.createdDate)}
                        </span>
                        <span className="text-xs text-gray-400 font-mono truncate max-w-[40%]" title={row.id}>
                          {row.id}
                        </span>
                      </header>
                      <div
                        className="report-html px-5 py-4 prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: row.html }}
                      />
                    </article>
                  ))}
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
