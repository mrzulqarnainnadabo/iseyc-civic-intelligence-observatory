/** Build the search string HashRouter users may put before or after the hash. */
export function adapterSearchFromLocation(pathnameSearch: string, hash: string): string {
  const fromHash = hash.includes('?') ? hash.slice(hash.indexOf('?') + 1) : '';
  const q = pathnameSearch.replace(/^\?/, '');
  if (q && fromHash) return `?${q}&${fromHash}`;
  if (fromHash) return `?${fromHash}`;
  if (q) return `?${q}`;
  return '';
}
