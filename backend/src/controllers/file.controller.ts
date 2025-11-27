import type { Request, Response } from 'express';

export const uploadFile = (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // In a real app, upload to S3/IPFS and return that URL.
        // Here we just return the local path or a mock URL.
        const fileUrl = `http://localhost:3001/uploads/${req.file.filename}`;

        res.status(200).json({ url: fileUrl, filename: req.file.filename, mimetype: req.file.mimetype });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
