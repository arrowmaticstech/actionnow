export function formatDateTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

const OUTCOME_STYLES = {
  report_generated: 'bg-green-100 text-green-800',
  passed_score: 'bg-blue-100 text-blue-800',
  not_send: 'bg-gray-100 text-gray-700',
  below_threshold: 'bg-amber-100 text-amber-800',
  no_messages: 'bg-gray-100 text-gray-500',
  error: 'bg-red-100 text-red-800',
};

export function OutcomeBadge({ outcome }) {
  const label = outcome ?? 'unknown';
  const cls = OUTCOME_STYLES[label] ?? 'bg-gray-100 text-gray-600';
  return (
    <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-medium ${cls}`}>
      {label.replace(/_/g, ' ')}
    </span>
  );
}

export function EmptyState({ children }) {
  return (
    <p className="text-sm text-gray-500 text-center py-8 rounded-xl border border-dashed border-gray-200">
      {children}
    </p>
  );
}

export function ErrorBanner({ message }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex gap-2">
      <span className="flex-shrink-0">⚠</span>
      <span>{message}</span>
    </div>
  );
}
