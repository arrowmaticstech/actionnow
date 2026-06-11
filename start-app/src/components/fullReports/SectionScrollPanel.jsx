import { useState } from 'react';
import { Search } from 'lucide-react';

const SCROLL_CLASS =
  'max-h-[28rem] overflow-y-auto overscroll-contain rounded-xl border border-gray-200 bg-wa-gray/10 p-3';

export default function SectionScrollPanel({
  placeholder = 'Filter rows…',
  totalCount,
  filteredCount,
  query,
  onQueryChange,
  children,
}) {
  const [internalQuery, setInternalQuery] = useState('');
  const q = query ?? internalQuery;
  const setQ = onQueryChange ?? setInternalQuery;
  const showCount = q.trim() && totalCount != null && filteredCount != null;

  return (
    <div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-wa-green/30 focus:border-wa-green"
        />
      </div>
      {showCount && (
        <p className="text-xs text-gray-400 mt-1.5 mb-0">
          Showing {filteredCount} of {totalCount} rows
        </p>
      )}
      <div className={`mt-2 ${SCROLL_CLASS}`}>{children}</div>
    </div>
  );
}
