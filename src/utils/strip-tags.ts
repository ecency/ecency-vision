export function stripTags(s: string) {
  return s.replace(/(<([^>]+)>)/gi, "");
}
