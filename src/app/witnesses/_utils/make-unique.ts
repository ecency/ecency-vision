export function makeUnique<T extends { name: string }>(array: T[]): T[] {
  return Array.from(new Map(array.map((item) => [item["name"], item])).values());
}
