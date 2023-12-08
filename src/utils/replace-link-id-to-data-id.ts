export function replaceLinkIdToData(str: string) {
  return str.replace(/<a id="/g, '<a data-id="');
}
