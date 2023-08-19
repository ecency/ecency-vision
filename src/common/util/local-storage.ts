export const PREFIX = "ecency";


export const get = (k: string, def: any = null): any => {
    if (typeof window === "undefined") {
        return null;
    }

    const key = `${PREFIX}_${k}`;
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : def;
};

export const set = (k: string, v: any): void => {
    if (typeof window === "undefined") {
        return;
    }

    const key = `${PREFIX}_${k}`;
    localStorage.setItem(key, JSON.stringify(v));
};

export const remove = (k: string): void => {
    if (typeof window === "undefined") {
        return;
    }

    const key = `${PREFIX}_${k}`;
    localStorage.removeItem(key);
};

export const getByPrefix = (prefix: string): any[] => {
    if (typeof window === "undefined") {
        return [];
    }

    const prefKey = `${PREFIX}_${prefix}`;

    return Object.keys(localStorage)
        .filter((key) => key.indexOf(prefKey) === 0)
        .map((key) => JSON.parse(localStorage[key]));
};
