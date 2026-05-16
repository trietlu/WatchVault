import { put } from '@vercel/blob';
import { env } from '../config/env.js';

interface StorePrivateFileInput {
    buffer: Buffer;
    contentType: string;
    filename: string;
    pathnamePrefix: string;
}

const sanitizeFilename = (filename: string): string => {
    return filename.replace(/[^a-zA-Z0-9._-]/g, '-').replace(/-+/g, '-');
};

export const storePrivateBlob = async (input: StorePrivateFileInput) => {
    if (!env.blobReadWriteToken) {
        throw new Error('BLOB_READ_WRITE_TOKEN is required for Vercel Blob uploads');
    }

    const pathname = `${input.pathnamePrefix}/${Date.now()}-${sanitizeFilename(input.filename)}`;

    return put(pathname, input.buffer, {
        access: 'private',
        contentType: input.contentType,
        token: env.blobReadWriteToken,
    });
};
