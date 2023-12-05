const PREFIX = "ecency";

export const get = (k: string, def: any = null): any => {
  if (typeof window === "undefined") {
    return null;
  }

  const key = `${PREFIX}_${k}`;
  const val = sessionStorage.getItem(key);
  return val ? JSON.parse(val) : def;
};

export const set = (k: string, v: any): void => {
  if (typeof window === "undefined") {
    return;
  }

  const key = `${PREFIX}_${k}`;
  sessionStorage.setItem(key, JSON.stringify(v));
};

export const remove = (k: string): void => {
  if (typeof window === "undefined") {
    return;
  }

  const key = `${PREFIX}_${k}`;
  sessionStorage.removeItem(key);
};

export const getByPrefix = (prefix: string): any[] => {
  if (typeof window === "undefined") {
    return [];
  }

  const prefKey = `${PREFIX}_${prefix}`;

  return Object.keys(sessionStorage)
    .filter((key) => key.indexOf(prefKey) === 0)
    .map((key) => JSON.parse(sessionStorage[key]));
};
