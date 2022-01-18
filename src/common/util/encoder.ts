import { history } from "../store";

export const encodeObj = (o: any): string => {
  return btoa(JSON.stringify(o));
};

export const decodeObj = (o: any): any => {
  let dataToParse = atob(o);
  if (dataToParse[0] !== "{") {
    return undefined;
  }
  let decodedValue = JSON.parse(dataToParse);
  return decodedValue;
};
