import defaults from "../constants/defaults.json";

export const apiBase = (endpoint: string): string => `${defaults.base}${endpoint}`;
