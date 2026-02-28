const ensureTrailingSlash = (value: string): string => (
    value.endsWith('/') ? value : `${value}/`
);

export const buildAbsoluteUrl = (baseUrl: string, pathname: string): string => {
    const normalizedPath = pathname.startsWith('/') ? pathname.slice(1) : pathname;
    return new URL(normalizedPath, ensureTrailingSlash(baseUrl)).toString();
};
