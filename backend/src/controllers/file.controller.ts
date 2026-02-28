import type { Request, Response } from 'express';
import { buildAbsoluteUrl } from '../lib/url.js';
import { env } from '../config/env.js';

export const uploadFile = (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const filePath = `/uploads/${req.file.filename}`;

        res.status(200).json({
            url: filePath,
            absoluteUrl: buildAbsoluteUrl(env.apiBaseUrl, filePath),
            filename: req.file.filename,
            mimetype: req.file.mimetype,
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
