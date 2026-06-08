import { useCallback, useEffect, useMemo, useState } from 'react';
import { Activity, FileText, CheckCircle, Bell, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { fetchLatestReports, REPORT_POLL_MS } from '../api/start';
import { markdownToHtml } from '../utils/markdown';
import {
  formatInterval,
  formatBossNumber,
  formatGroupCount,
  formatKeywordCount,
  formatContentTypes,
  getGroupLabel,
  getBossNumberValue,
} from '../utils/format';

function formatReportTime(iso) {
  if (!iso) return 'Unknown time';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'Unknown time';
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function StatusPanel({ config, ownerEmail = '', ownerPhone = '' }) {
  const groupCount = config.groups.length;
  const keywordCount = config.keywords.length;
  const recipientCount = config.bossNumbers
    .map(getBossNumberValue)
    .map((n) => n.trim())
    .filter(Boolean).length;

  const statusLabel = config.supervisionLabel?.trim() || 'Untitled supervision';

  const [reports, setReports] = useState([]);
  const [reportLoading, setReportLoading] = useState(true);
  const [reportError, setReportError] = useState(null);
  const [lastReportFetch, setLastReportFetch] = useState(null);

  const loadReports = useCallback(async (isInitial = false) => {
    if (isInitial) setReportLoading(true);
    try {
      const items = await fetchLatestReports({
        ownerEmail: ownerEmail || undefined,
        ownerPhone: ownerPhone || undefined,
      });
      setReports(items);
      setReportError(null);
      setLastReportFetch(new Date());
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      setReportError(error.message || 'Failed to load reports');
    } finally {
      if (isInitial) setReportLoading(false);
    }
  }, [ownerEmail, ownerPhone]);

  useEffect(() => {
    loadReports(true);
    const timer = setInterval(() => loadReports(false), REPORT_POLL_MS);
    return () => clearInterval(timer);
  }, [loadReports]);

  const latestReport = reports[0] ?? null;

  const latestReportHtml = useMemo(() => {
    if (!latestReport?.markdown) return '';
    return markdownToHtml(latestReport.markdown);
  }, [latestReport?.markdown]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xl shadow-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-wa-green" />
            Agent Status
          </h3>
          <span className="flex items-center gap-1.5 text-sm text-wa-green font-semibold" id="statusBadge">
            <span className="w-2 h-2 bg-wa-green rounded-full animate-pulse" /> Running
          </span>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-50">
            <span className="text-sm text-gray-500">Supervision</span>
            <span className="text-sm font-semibold text-gray-800 text-right max-w-[60%] truncate" title={statusLabel}>
              {statusLabel}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-50">
            <span className="text-sm text-gray-500">Groups monitored</span>
            <span className="text-sm font-semibold text-gray-800" id="groupCount">
              {formatGroupCount(groupCount)}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-50">
            <span className="text-sm text-gray-500">Check interval</span>
            <span className="text-sm font-semibold text-gray-800" id="displayInterval">
              {formatInterval(config.interval)}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-50">
            <span className="text-sm text-gray-500">Reporting to</span>
            <span className="text-sm font-semibold text-gray-800 text-right max-w-[60%] truncate" id="displayNumber" title={formatBossNumber(config.bossNumbers)}>
              {recipientCount === 0 ? 'None' : formatBossNumber(config.bossNumbers)}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-50">
            <span className="text-sm text-gray-500">Keywords tracked</span>
            <span className="text-sm font-semibold text-gray-800" id="keywordCount">
              {formatKeywordCount(keywordCount)}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-50">
            <span className="text-sm text-gray-500">Content types</span>
            <span className="text-sm font-semibold text-gray-800 text-right max-w-[60%] truncate capitalize">
              {formatContentTypes(config.contentTypes)}
            </span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-gray-500">Last checked</span>
            <span className="text-sm font-semibold text-gray-800" id="lastChecked">
              {config.lastChecked}
            </span>
          </div>
        </div>

        {groupCount > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Selected groups</p>
            <ul className="space-y-1">
              {config.groups.map((group, i) => (
                <li key={i} className="text-xs text-gray-600 truncate" title={getGroupLabel(group)}>
                  • {getGroupLabel(group)}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-xl shadow-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-wa-green" />
            Latest Report
          </h3>
          <button
            type="button"
            onClick={() => loadReports(true)}
            disabled={reportLoading}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-wa-green transition-colors disabled:opacity-50"
            title="Refresh now"
          >
            {reportLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" />
            )}
            Refresh
          </button>
        </div>

        <div className="bg-wa-gray rounded-xl p-4 space-y-3">
          {reportLoading && !latestReport ? (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading latest report…
            </div>
          ) : reportError && !latestReport ? (
            <div className="flex items-start gap-2 py-4 text-sm text-red-600">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{reportError}</span>
            </div>
          ) : !latestReport ? (
            <p className="text-sm text-gray-500 text-center py-6">
              No reports yet. They will appear here after the agent generates one.
            </p>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-wa-green rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800">Report Generated</p>
                  <p className="text-xs text-gray-400">
                    {formatReportTime(latestReport.createdDate)}
                    {lastReportFetch && (
                      <> · synced {formatReportTime(lastReportFetch.toISOString())}</>
                    )}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 max-h-96 overflow-y-auto">
                <div
                  className="report-html"
                  dangerouslySetInnerHTML={{ __html: latestReportHtml }}
                />
              </div>

              {reports.length > 1 && (
                <p className="text-xs text-gray-400 text-center">
                  Showing latest of {reports.length} report{reports.length !== 1 ? 's' : ''}
                </p>
              )}
            </>
          )}

          <p className="text-xs text-gray-400 text-center">
            Auto-refreshes every minute
            {recipientCount === 0
              ? ' · no WhatsApp recipients configured'
              : ` · also sent to ${formatBossNumber(config.bossNumbers)}`}
          </p>
        </div>
      </div>

      <div
        id="toastNotification"
        className={`fixed top-6 left-1/2 z-50 bg-wa-dark text-white rounded-xl p-4 flex items-center gap-3 shadow-xl transition-all duration-300 min-w-[320px] max-w-[90vw] ${
          config.showToast
            ? 'opacity-100 -translate-x-1/2 translate-y-0 pointer-events-auto'
            : 'opacity-0 -translate-x-1/2 -translate-y-2 pointer-events-none'
        }`}
      >
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
          <Bell className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold">Configuration saved!</p>
          <p className="text-xs text-green-300">Agent is now monitoring with updated settings.</p>
        </div>
        <span className="text-xs text-white/50">Now</span>
      </div>
    </div>
  );
}
