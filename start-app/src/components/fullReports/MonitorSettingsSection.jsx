import { useMemo, useState } from 'react';
import { RawDbRowList } from './RawDbRow';
import { rowMatchesQuery } from './filterUtils';
import SectionScrollPanel from './SectionScrollPanel';

export default function MonitorSettingsSection({ monitorSettings = [] }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(
    () => monitorSettings.filter((r) => rowMatchesQuery(r, query)),
    [monitorSettings, query],
  );

  const noMatch = query.trim() && filtered.length === 0 && monitorSettings.length > 0;

  return (
    <div>
      <p className="text-xs text-gray-500 mb-3">
        Table: <code>monitor_settings</code> · filter: <code>owner_phone_num</code>
      </p>
      <SectionScrollPanel
        placeholder="Filter settings…"
        query={query}
        onQueryChange={setQuery}
        totalCount={monitorSettings.length}
        filteredCount={filtered.length}
      >
        {noMatch ? (
          <p className="text-sm text-gray-500 text-center py-8">No rows match &ldquo;{query}&rdquo;</p>
        ) : (
          <RawDbRowList
            rows={filtered}
            emptyLabel="No monitor settings for this owner_phone_num."
            titleForRow={(row) => `setting · ${row.monitor_name ?? row.id}`}
          />
        )}
      </SectionScrollPanel>
    </div>
  );
}
