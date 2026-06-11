import { useMemo, useState } from 'react';
import { RawDbRowList } from './RawDbRow';
import { rowMatchesQuery } from './filterUtils';
import SectionScrollPanel from './SectionScrollPanel';

export default function ManagerReportsSection({ monitorResults = [] }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(
    () => monitorResults.filter((r) => rowMatchesQuery(r, query)),
    [monitorResults, query],
  );

  const noMatch = query.trim() && filtered.length === 0 && monitorResults.length > 0;

  return (
    <div>
      <p className="text-xs text-gray-500 mb-3">
        Table: <code>monitor_results</code> · filter: <code>owner_phone_num</code>
      </p>
      <SectionScrollPanel
        placeholder="Filter reports…"
        query={query}
        onQueryChange={setQuery}
        totalCount={monitorResults.length}
        filteredCount={filtered.length}
      >
        {noMatch ? (
          <p className="text-sm text-gray-500 text-center py-8">No rows match &ldquo;{query}&rdquo;</p>
        ) : (
          <RawDbRowList
            rows={filtered}
            emptyLabel="No monitor results for this owner_phone_num."
            titleForRow={(row) => `report · ${row.id}`}
          />
        )}
      </SectionScrollPanel>
    </div>
  );
}
