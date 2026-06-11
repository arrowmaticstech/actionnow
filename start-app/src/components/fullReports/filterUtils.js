/** Simple client-side filter — matches any cell value in the row (incl. nested JSON). */
export function rowMatchesQuery(row, query) {
  const q = String(query ?? '').trim().toLowerCase();
  if (!q) return true;
  try {
    return JSON.stringify(row).toLowerCase().includes(q);
  } catch {
    return false;
  }
}
