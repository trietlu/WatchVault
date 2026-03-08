import Constants from 'expo-constants';

const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, '');

const LOCALHOST_HOSTNAMES = new Set(['localhost', '127.0.0.1', '::1']);

const isPrivateIpv4 = (value: string): boolean => {
  const octets = value.split('.').map((part) => Number(part));
  if (octets.length !== 4 || octets.some((octet) => Number.isNaN(octet))) {
    return false;
  }

  const [a, b] = octets;
  return (
    a === 10 ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168)
  );
};

const resolveExpoHost = (): string | null => {
  const hostUri = Constants.expoConfig?.hostUri;
  if (!hostUri) {
    return null;
  }

  const host = hostUri.split(':')[0]?.trim();
  if (!host || !isPrivateIpv4(host)) {
    return null;
  }

  return host;
};

const resolveLocalDevBaseUrl = (value: string): string => {
  const trimmedValue = trimTrailingSlash(value);

  try {
    const parsed = new URL(trimmedValue);
    if (!LOCALHOST_HOSTNAMES.has(parsed.hostname)) {
      return trimmedValue;
    }

    const expoHost = resolveExpoHost();
    if (!expoHost) {
      return trimmedValue;
    }

    parsed.hostname = expoHost;
    return trimTrailingSlash(parsed.toString());
  } catch {
    return trimmedValue;
  }
};

export const appConfig = {
  apiBaseUrl: resolveLocalDevBaseUrl(
    process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:3001'
  ),
  appBaseUrl: resolveLocalDevBaseUrl(
    process.env.EXPO_PUBLIC_APP_BASE_URL ?? 'http://localhost:3000'
  ),
};

export const buildPublicPassportUrl = (publicId: string): string =>
  `${appConfig.appBaseUrl}/p/${publicId}`;

export const getApiAssetUrl = (pathname: string): string =>
  pathname.startsWith('http://') || pathname.startsWith('https://')
    ? pathname
    : `${appConfig.apiBaseUrl}${pathname.startsWith('/') ? pathname : `/${pathname}`}`;
