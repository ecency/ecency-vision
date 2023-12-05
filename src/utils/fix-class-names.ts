export function fixClassNames(s: string): string {
  return s
    .split(" ")
    .map((x) => x.trim())
    .filter((x) => x)
    .join(" ")
    .trim();
}
