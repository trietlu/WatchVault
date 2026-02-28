const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, '');

export const appConfig = {
    apiBaseUrl: trimTrailingSlash(process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001'),
    appBaseUrl: trimTrailingSlash(process.env.NEXT_PUBLIC_APP_BASE_URL ?? 'http://localhost:3000'),
};

export const buildPublicPassportUrl = (publicId: string): string => (
    `${appConfig.appBaseUrl}/p/${publicId}`
);

export const getApiAssetUrl = (pathname: string): string => (
    pathname.startsWith('http://') || pathname.startsWith('https://')
        ? pathname
        : `${appConfig.apiBaseUrl}${pathname.startsWith('/') ? pathname : `/${pathname}`}`
);
