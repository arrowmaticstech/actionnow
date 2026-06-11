import { useMemo, useState } from 'react';
import { RawDbRow, RawDbRowList } from './RawDbRow';
import { rowMatchesQuery } from './filterUtils';
import SectionScrollPanel from './SectionScrollPanel';

export default function MessagesReceivedSection({ textMessages = [], media = [] }) {
  const [query, setQuery] = useState('');

  const filteredText = useMemo(
    () => textMessages.filter((r) => rowMatchesQuery(r, query)),
    [textMessages, query],
  );
  const filteredMedia = useMemo(
    () => media.filter((m) => rowMatchesQuery(m, query)),
    [media, query],
  );

  const totalCount = textMessages.length + media.length;
  const filteredCount = filteredText.length + filteredMedia.length;
  const hasData = totalCount > 0;
  const noMatch = query.trim() && filteredCount === 0 && hasData;

  return (
    <SectionScrollPanel
      placeholder="Filter text & media rows…"
      query={query}
      onQueryChange={setQuery}
      totalCount={totalCount}
      filteredCount={filteredCount}
    >
      <div className="space-y-10">
        {noMatch ? (
          <p className="text-sm text-gray-500 text-center py-8">No rows match &ldquo;{query}&rdquo;</p>
        ) : (
          <>
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 sticky top-0 bg-wa-gray/95 py-1 z-10">
                Text — <code className="text-xs font-normal text-gray-500">whatsapp_messages</code>
                <span className="text-gray-400 font-normal ml-2">({filteredText.length})</span>
              </h3>
              <RawDbRowList
                rows={filteredText}
                emptyLabel="No text messages for this owner_phone_num."
                titleForRow={(row) => row.message_id || row.id || 'message'}
              />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 sticky top-0 bg-wa-gray/95 py-1 z-10">
                Media — <code className="text-xs font-normal text-gray-500">whatsapp_message_media</code>
                <span className="text-gray-400 font-normal ml-2">({filteredMedia.length})</span>
              </h3>
              {!filteredMedia.length ? (
                <p className="text-sm text-gray-500 text-center py-6">
                  {media.length ? 'No media rows match filter.' : 'No media rows for this owner_phone_num.'}
                </p>
              ) : (
                <div className="space-y-6">
                  {filteredMedia.map((item) => (
                    <div key={item.id} className="space-y-2">
                      <RawDbRow
                        row={item}
                        title={`media · ${item.media_kind ?? '?'} · ${item.message_id ?? item.id}`}
                        defaultOpen
                      />
                      {(item.interpretations?.length ?? 0) > 0 && (
                        <div className="ml-4 pl-4 border-l-2 border-wa-green/30 space-y-2">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            interpretations (media_id = {item.id})
                          </p>
                          {item.interpretations.map((interp) => (
                            <RawDbRow
                              key={interp.id}
                              row={interp}
                              title={`${interp.interpretation_type ?? 'interp'} · ${interp.status ?? ''}`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </SectionScrollPanel>
  );
}
