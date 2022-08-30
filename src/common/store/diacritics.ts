export function removeDiacritics(str: string) {
  let normalizedString = decodeURI(str);
  return normalizedString;
}
