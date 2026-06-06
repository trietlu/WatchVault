import { del, get, put } from '@vercel/blob';
import { env } from '../config/env.js';

interface StoreBlobInput {
    buffer: Buffer;
    contentType: string;
    filename: string;
    pathnamePrefix: string;
}

const sanitizeFilename = (filename: string): string => {
    return filename.replace(/[^a-zA-Z0-9._-]/g, '-').replace(/-+/g, '-');
};

const resolveBlobOptions = () => {
    if (!env.blobReadWriteToken && !env.blobStoreId) {
        throw new Error('BLOB_STORE_ID with Vercel OIDC auth or BLOB_READ_WRITE_TOKEN is required for Vercel Blob operations');
    }

    return {
        ...(env.blobReadWriteToken ? { token: env.blobReadWriteToken } : {}),
        ...(env.blobStoreId ? { storeId: env.blobStoreId } : {}),
    };
};

const storeBlob = async (input: StoreBlobInput, access: 'public' | 'private') => {
    const pathname = `${input.pathnamePrefix}/${Date.now()}-${sanitizeFilename(input.filename)}`;

    return put(pathname, input.buffer, {
        access,
        contentType: input.contentType,
        ...resolveBlobOptions(),
    });
};

export const storePrivateBlob = async (input: StoreBlobInput) => storeBlob(input, 'private');

export const storePublicBlob = async (input: StoreBlobInput) => storeBlob(input, 'public');

export const deleteBlob = async (urlOrPathname: string) => {
    await del(urlOrPathname, {
        ...resolveBlobOptions(),
    });
};

export const getBlob = async (urlOrPathname: string, access: 'public' | 'private') => get(urlOrPathname, {
    access,
    ...resolveBlobOptions(),
});
