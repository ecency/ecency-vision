export function useFilteredProps<P extends object, R extends Record<any, any>>(
  source: P,
  droppingProps: (keyof R)[]
): any {
  return Object.keys(source)
    .filter((k) => !droppingProps.includes(k))
    .reduce<R>((acc, k) => ({ ...acc, [k]: (source as any)[k] }), {} as R);
}
