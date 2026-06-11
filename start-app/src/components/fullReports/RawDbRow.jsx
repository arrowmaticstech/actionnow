function formatCell(value) {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

export function RawDbRow({ row, title, defaultOpen = false }) {
  if (!row || typeof row !== 'object') return null;

  const entries = Object.entries(row).filter(([k]) => k !== 'interpretations');

  return (
    <details
      className="rounded-xl border border-gray-200 bg-white overflow-hidden group"
      open={defaultOpen}
    >
      <summary className="cursor-pointer px-4 py-2.5 text-sm font-medium text-gray-800 bg-wa-gray/30 hover:bg-wa-gray/50 list-none flex items-center justify-between">
        <span>{title}</span>
        <span className="text-xs text-gray-400 font-normal">{entries.length} fields</span>
      </summary>
      <dl className="px-4 pb-4 pt-2 space-y-0 divide-y divide-gray-50">
        {entries.map(([key, value]) => (
          <div key={key} className="grid grid-cols-1 sm:grid-cols-[minmax(8rem,11rem)_1fr] gap-1 sm:gap-3 py-2 text-xs">
            <dt className="text-gray-400 font-mono break-all">{key}</dt>
            <dd className="text-gray-800 font-mono whitespace-pre-wrap break-all">{formatCell(value)}</dd>
          </div>
        ))}
      </dl>
    </details>
  );
}

export function RawDbRowList({ rows, titleForRow, emptyLabel = 'No rows.' }) {
  if (!rows?.length) {
    return <p className="text-sm text-gray-500 text-center py-8">{emptyLabel}</p>;
  }

  return (
    <div className="space-y-3">
      {rows.map((row, i) => (
        <RawDbRow
          key={row.id ?? row.message_id ?? i}
          row={row}
          title={titleForRow(row, i)}
        />
      ))}
    </div>
  );
}
