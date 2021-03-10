import isElectron from "../util/is-electron";

import defaults from "../constants/defaults.json";

export const apiBase = (endpoint: string): string => {
    let base = '';

    if (isElectron()) {
        if (process.env.NODE_ENV === "development") {
            base = "http://localhost:3000";
        } else {
            base = defaults.base;
        }
    }

    return `${base}${endpoint}`;
}
