export function classNameObject(obj: Record<string, boolean | undefined>): string {
  return Object.entries(obj)
    .filter(([className, isActive]) => !!isActive)
    .map(([className]) => className)
    .join(" ");
}
