export function makePath(filter: string, tag: string): string {
  // created is default filter for community pages
  if (isCommunity(tag)) {
    return `/${EntryFilter.created}/${tag}`;
  }

  if (EntryFilter[filter] === undefined) {
    return `/${EntryFilter.created}/${tag}`;
  }

  return `/${filter}/${tag}`;
}
