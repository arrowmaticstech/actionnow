import { useMemo, useState } from 'react';
import { RawDbRowList } from './RawDbRow';
import { rowMatchesQuery } from './filterUtils';
import SectionScrollPanel from './SectionScrollPanel';

export default function AgentThinkingSection({ attemptLogs = [] }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(
    () => attemptLogs.filter((r) => rowMatchesQuery(r, query)),
    [attemptLogs, query],
  );

  const noMatch = query.trim() && filtered.length === 0 && attemptLogs.length > 0;

  return (
    <div>
      <p className="text-xs text-gray-500 mb-3">
        Table: <code>monitor_attempt_logs</code> · filter: <code>owner_phone_num</code>
      </p>
      <SectionScrollPanel
        placeholder="Filter attempt logs…"
        query={query}
        onQueryChange={setQuery}
        totalCount={attemptLogs.length}
        filteredCount={filtered.length}
      >
        {noMatch ? (
          <p className="text-sm text-gray-500 text-center py-8">No rows match &ldquo;{query}&rdquo;</p>
        ) : (
          <RawDbRowList
            rows={filtered}
            emptyLabel="No attempt logs for this owner_phone_num."
            titleForRow={(row) => `${row.monitor_name ?? 'attempt'} · ${row.outcome ?? ''} · ${row.id}`}
          />
        )}
      </SectionScrollPanel>
    </div>
  );
}
