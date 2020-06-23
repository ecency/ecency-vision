export const encodeObj = (o: any): string => {
  return btoa(JSON.stringify(o));
};

export const decodeObj = (o: any): any => {
  return JSON.parse(atob(o));
};
