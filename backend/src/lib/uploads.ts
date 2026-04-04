import fs from 'fs';
import path from 'path';
import { env } from '../config/env.js';

const uploadsRoot = process.env.VERCEL
    ? path.join('/tmp', env.uploadsDir)
    : path.resolve(process.cwd(), env.uploadsDir);

export const getUploadsRoot = (): string => uploadsRoot;

export const ensureUploadsDirectory = (...segments: string[]): string => {
    const targetDirectory = path.join(uploadsRoot, ...segments);

    if (!fs.existsSync(targetDirectory)) {
        fs.mkdirSync(targetDirectory, { recursive: true });
    }

    return targetDirectory;
};

export const resolveUploadedFilePath = (urlPath: string): string => {
    const relativePath = urlPath.replace(/^\/uploads\/?/, '');
    return path.join(uploadsRoot, relativePath);
};
