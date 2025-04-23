export type FlatJsonValue = string | number | boolean | null;
export type FlatJsonObject = Record<string, FlatJsonValue>;
export type FlatJsonStatus = 'loading' | 'success' | 'error' | null;
