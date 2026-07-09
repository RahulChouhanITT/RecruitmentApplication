const API_PREFIX = '/api';
const SOCKET_IO_PATH = '/api/socket.io';
const DEVELOPMENT_API_ORIGIN = 'http://localhost:5000';

const trimTrailingSlashes = (value: string): string => value.replace(/\/+$/, '');

const normalizeConfiguredApiOrigin = (value: string): string => {
  const trimmedValue = trimTrailingSlashes(value.trim());

  if (!trimmedValue || trimmedValue === API_PREFIX) {
    return '';
  }

  if (trimmedValue.endsWith(API_PREFIX)) {
    return trimTrailingSlashes(trimmedValue.slice(0, -API_PREFIX.length));
  }

  return trimmedValue;
};

const resolveApiOrigin = (): string => {
  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL;

  if (configuredBaseUrl?.trim()) {
    return normalizeConfiguredApiOrigin(configuredBaseUrl);
  }

  return import.meta.env.DEV ? DEVELOPMENT_API_ORIGIN : '';
};

const normalizePathname = (path: string): string => {
  const trimmedPath = path.trim();

  if (!trimmedPath) {
    return API_PREFIX;
  }

  const withLeadingSlash = trimmedPath.startsWith('/') ? trimmedPath : `/${trimmedPath}`;

  return withLeadingSlash.startsWith(`${API_PREFIX}/`) || withLeadingSlash === API_PREFIX
    ? withLeadingSlash
    : `${API_PREFIX}${withLeadingSlash}`;
};

const getBrowserOrigin = (): string => {
  if (typeof window !== 'undefined' && window.location.origin) {
    return window.location.origin;
  }

  return '';
};

export const API_ORIGIN = resolveApiOrigin();
export const API_HTTP_BASE_URL = API_ORIGIN;
export const API_BASE_PATH = API_PREFIX;
export const API_SOCKET_PATH = SOCKET_IO_PATH;

export const buildApiPath = (path: string): string => normalizePathname(path);

export const buildApiUrl = (path: string): string => {
  const apiPath = buildApiPath(path);

  if (API_ORIGIN) {
    return `${API_ORIGIN}${apiPath}`;
  }

  const browserOrigin = getBrowserOrigin();
  return browserOrigin ? new URL(apiPath, browserOrigin).toString() : apiPath;
};

export const getSocketServerUrl = (): string => API_ORIGIN || getBrowserOrigin();
