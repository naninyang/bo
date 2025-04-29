export type FlatJsonValue = string | number | boolean | null;
export type FlatJsonObject = Record<string, FlatJsonValue>;
export type FlatJsonStatus = 'loading' | 'success' | 'error' | null;

export type AuthType = 'none' | 'basic' | 'bearer';
export type BasicAuthData = { username: string; password: string };
export type BearerAuthData = string;
export type ApiKeyAuthData = { key: string; value: string };
export type NoAuthData = '';
export type AuthData = BasicAuthData | BearerAuthData | ApiKeyAuthData | NoAuthData;
