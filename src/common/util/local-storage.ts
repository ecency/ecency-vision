const PREFIX = "ecency";

export const get = (k: string, def: any = null): any => {
  const key = `${PREFIX}_${k}`;
  const val = localStorage.getItem(key);
  return val ? JSON.parse(val) : def;
};

export const set = (k: string, v: any): void => {
  const key = `${PREFIX}_${k}`;
  localStorage.setItem(key, JSON.stringify(v));
};

export const remove = (k: string): void => {
  const key = `${PREFIX}_${k}`;
  localStorage.removeItem(key);
};
