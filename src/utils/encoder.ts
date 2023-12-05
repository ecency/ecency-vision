export function encodeObj(o: any): string {
  return btoa(JSON.stringify(o));
}

export function decodeObj(o: any): any {
  let dataToParse = atob(o);
  if (dataToParse[0] !== "{") {
    return undefined;
  }
  return JSON.parse(dataToParse);
}
