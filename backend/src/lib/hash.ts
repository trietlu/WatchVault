import { createHash, createHmac } from 'crypto';

type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };

const normalizeJson = (value: unknown): JsonValue => {
    if (value === null || typeof value === 'string' || typeof value === 'boolean') {
        return value;
    }

    if (typeof value === 'number') {
        if (!Number.isFinite(value)) {
            throw new Error('Cannot hash non-finite numbers');
        }

        return value;
    }

    if (value instanceof Date) {
        return value.toISOString();
    }

    if (Array.isArray(value)) {
        return value.map(normalizeJson);
    }

    if (typeof value === 'object' && value !== null) {
        return Object.keys(value as Record<string, unknown>)
            .sort()
            .reduce<Record<string, JsonValue>>((acc, key) => {
                const child = (value as Record<string, unknown>)[key];
                if (child !== undefined) {
                    acc[key] = normalizeJson(child);
                }

                return acc;
            }, {});
    }

    throw new Error(`Cannot hash unsupported value type: ${typeof value}`);
};

export const canonicalJsonStringify = (value: unknown): string => {
    return JSON.stringify(normalizeJson(value));
};

export const sha256Hex = (value: string | Buffer): string => {
    return createHash('sha256').update(value).digest('hex');
};

export const hmacSha256Hex = (secret: string, value: string): string => {
    return createHmac('sha256', secret).update(value).digest('hex');
};

export const toBytes32 = (hex: string): string => {
    const normalized = hex.startsWith('0x') ? hex.slice(2) : hex;
    if (!/^[0-9a-fA-F]{64}$/.test(normalized)) {
        throw new Error('Expected a 32-byte hex string');
    }

    return `0x${normalized}`;
};
