export const lsGet = (key: string): string | null => {
    if (typeof localStorage === 'undefined') {
        return null;
    }

    return localStorage.getItem(key);
};

export const lsSet = (key: string, value: string): void => {
    if (typeof localStorage === 'undefined') {
        return;
    }

    localStorage.setItem(key, value);
};
