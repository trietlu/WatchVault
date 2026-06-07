import type { Request, Response } from 'express';
import prisma from '../prisma.js';
import fs from 'fs';
import { randomUUID } from 'crypto';
import { Readable } from 'stream';
import { env } from '../config/env.js';
import { buildAbsoluteUrl } from '../lib/url.js';
import { resolveUploadedFilePath } from '../lib/uploads.js';
import { canonicalJsonStringify, sha256Hex } from '../lib/hash.js';
import { deleteBlob, getBlob, storePrivateBlob } from '../lib/blob-storage.js';
import { anchorEventProof, initialAnchorStatus } from '../services/onchain.service.js';

// Helper to hash serial number
const hashSerial = (serial: string) => {
    return sha256Hex(serial);
};

const getAuthenticatedUserId = (req: Request): number | undefined => req.user?.userId;

const storeWatchImageBlob = async (publicId: string, file: Express.Multer.File) => {
    const checksumSha256 = sha256Hex(file.buffer);
    const blob = await storePrivateBlob({
        buffer: file.buffer,
        contentType: file.mimetype,
        filename: file.originalname,
        pathnamePrefix: `watches/${publicId}/images`,
    });

    return { blob, checksumSha256 };
};

export const createWatch = async (req: Request, res: Response) => {
    let uploadedImageToCleanup: string | undefined;

    try {
        const { brand, model, serialNumber } = req.body;
        const userId = getAuthenticatedUserId(req);
        const file = req.file;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (!brand || !model || !serialNumber) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const serialNumberHash = hashSerial(serialNumber);

        const existingWatch = await prisma.watch.findUnique({
            where: { serialNumberHash },
        });

        if (existingWatch) {
            return res.status(400).json({ error: 'Watch already registered' });
        }

        // Record MINT event
        const payload = { brand, model, serialNumberHash, mintedBy: userId };
        const payloadJson = canonicalJsonStringify(payload);
        const payloadHash = sha256Hex(payloadJson);

        const publicId = randomUUID();
        const uploadedImage = file
            ? await storeWatchImageBlob(publicId, file)
            : undefined;
        uploadedImageToCleanup = uploadedImage?.blob.url;

        const { mintEvent, qrCodeUrl, updatedWatch } = await prisma.$transaction(async (tx) => {
            const watch = await tx.watch.create({
                data: {
                    brand,
                    model,
                    serialNumberHash,
                    publicId,
                    ownerId: userId,
                },
            });

            if (file && uploadedImage) {
                await tx.fileRecord.create({
                    data: {
                        watchId: watch.id,
                        uploadedById: userId,
                        url: uploadedImage.blob.url,
                        storageProvider: 'vercel_blob',
                        storageKey: uploadedImage.blob.pathname,
                        type: 'image',
                        mimeType: file.mimetype,
                        sizeBytes: file.size,
                        checksumSha256: uploadedImage.checksumSha256,
                        visibility: 'PRIVATE',
                    },
                });
            }

            const qrCodeUrl = buildAbsoluteUrl(env.appBaseUrl, `/p/${watch.publicId}`);
            const updatedWatch = await tx.watch.update({
                where: { id: watch.id },
                data: { qrCodeUrl },
            });

            const mintEvent = await tx.watchEvent.create({
                data: {
                    watchId: watch.id,
                    eventType: 'MINT',
                    payloadJson,
                    payloadHash,
                    anchorStatus: initialAnchorStatus('MINT'),
                },
            });

            return { mintEvent, qrCodeUrl, updatedWatch };
        });
        uploadedImageToCleanup = undefined;

        try {
            if (env.blockchainEnabled) {
                await anchorEventProof({
                    eventId: mintEvent.id,
                    eventUid: mintEvent.eventUid,
                    watchCommitment: serialNumberHash,
                    eventType: mintEvent.eventType,
                    payloadHash,
                    schemaVersion: mintEvent.schemaVersion,
                });
            }
        } catch (chainError) {
            console.error('MINT blockchain anchoring failed:', chainError);
        }

        res.status(201).json({ watch: updatedWatch, qrCodeUrl });
    } catch (error) {
        if (uploadedImageToCleanup) {
            try {
                await deleteBlob(uploadedImageToCleanup);
            } catch (cleanupError) {
                console.error('Failed to clean up uploaded watch image blob:', cleanupError);
            }
        }
        console.error('Create watch error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getWatches = async (req: Request, res: Response) => {
    try {
        const userId = getAuthenticatedUserId(req);
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const watches = await prisma.watch.findMany({
            where: { ownerId: userId },
            include: { events: true, files: { where: { type: 'image' } } },
        });

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { email: true },
        });
        console.info('Get watches resolved user', {
            userId,
            email: user?.email,
            watchCount: watches.length,
            origin: req.headers.origin,
            vercelEnv: process.env.VERCEL_ENV,
            vercelUrl: process.env.VERCEL_URL,
        });

        res.status(200).json(watches);
    } catch (error) {
        console.error('Get watches error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getWatchDetail = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = getAuthenticatedUserId(req);

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const watch = await prisma.watch.findFirst({
            where: { id: Number(id), ownerId: userId },
            include: { events: { include: { files: true } }, files: true },
        });

        if (!watch) {
            return res.status(404).json({ error: 'Watch not found' });
        }

        res.status(200).json(watch);
    } catch (error) {
        console.error('Get watch detail error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const uploadWatchImage = async (req: Request, res: Response) => {
    let uploadedImageToCleanup: string | undefined;

    try {
        const { id } = req.params;
        const userId = getAuthenticatedUserId(req);
        const file = req.file;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (!file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        const watch = await prisma.watch.findFirst({
            where: { id: Number(id), ownerId: userId },
            include: { files: { where: { type: 'image' } } },
        });

        if (!watch) {
            return res.status(404).json({ error: 'Watch not found' });
        }

        // Check if watch already has an image
        if (watch.files.length > 0) {
            return res.status(400).json({ error: 'Watch already has an image. Delete the existing image first.' });
        }

        const { blob, checksumSha256 } = await storeWatchImageBlob(watch.publicId, file);
        uploadedImageToCleanup = blob.url;
        const fileRecord = await prisma.fileRecord.create({
            data: {
                watchId: watch.id,
                uploadedById: userId,
                url: blob.url,
                storageProvider: 'vercel_blob',
                storageKey: blob.pathname,
                type: 'image',
                mimeType: file.mimetype,
                sizeBytes: file.size,
                checksumSha256,
                visibility: 'PRIVATE',
            },
        });
        uploadedImageToCleanup = undefined;

        res.status(201).json(fileRecord);
    } catch (error) {
        if (uploadedImageToCleanup) {
            try {
                await deleteBlob(uploadedImageToCleanup);
            } catch (cleanupError) {
                console.error('Failed to clean up uploaded watch image blob:', cleanupError);
            }
        }
        console.error('Upload image error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getWatchImageContent = async (req: Request, res: Response) => {
    try {
        const { id, fileId } = req.params;
        const userId = getAuthenticatedUserId(req);

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const watch = await prisma.watch.findFirst({
            where: { id: Number(id), ownerId: userId },
            select: { id: true },
        });

        if (!watch) {
            return res.status(404).json({ error: 'Watch not found' });
        }

        const fileRecord = await prisma.fileRecord.findUnique({
            where: { id: Number(fileId) },
        });

        if (!fileRecord || fileRecord.watchId !== Number(id) || fileRecord.type !== 'image') {
            return res.status(404).json({ error: 'Image not found' });
        }

        if (fileRecord.storageProvider === 'vercel_blob') {
            const blobAccess = fileRecord.visibility === 'PUBLIC' ? 'public' : 'private';
            const blob = await getBlob(fileRecord.storageKey ?? fileRecord.url, blobAccess);

            if (!blob || blob.statusCode !== 200 || !blob.stream) {
                return res.status(404).json({ error: 'Image not found' });
            }

            if (blob.blob.size) {
                res.setHeader('Content-Length', String(blob.blob.size));
            }

            res.setHeader('Content-Type', fileRecord.mimeType ?? blob.blob.contentType ?? 'application/octet-stream');
            res.setHeader('Cache-Control', 'private, max-age=300');
            Readable.fromWeb(blob.stream as Parameters<typeof Readable.fromWeb>[0]).pipe(res);
            return;
        }

        const filePath = resolveUploadedFilePath(fileRecord.url);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'Image not found' });
        }

        res.setHeader('Content-Type', fileRecord.mimeType ?? 'application/octet-stream');
        res.setHeader('Cache-Control', 'private, max-age=300');
        fs.createReadStream(filePath).pipe(res);
    } catch (error) {
        console.error('Get image content error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const deleteWatchImage = async (req: Request, res: Response) => {
    try {
        const { id, fileId } = req.params;
        const userId = getAuthenticatedUserId(req);

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const watch = await prisma.watch.findFirst({
            where: { id: Number(id), ownerId: userId },
            select: { id: true },
        });

        if (!watch) {
            return res.status(404).json({ error: 'Watch not found' });
        }

        const fileRecord = await prisma.fileRecord.findUnique({
            where: { id: Number(fileId) },
        });

        if (!fileRecord || fileRecord.watchId !== Number(id) || fileRecord.type !== 'image') {
            return res.status(404).json({ error: 'Image not found' });
        }

        if (fileRecord.storageProvider === 'vercel_blob') {
            await deleteBlob(fileRecord.storageKey ?? fileRecord.url);
        } else {
            const filePath = resolveUploadedFilePath(fileRecord.url);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        // Delete record from database
        await prisma.fileRecord.delete({
            where: { id: Number(fileId) },
        });

        res.status(200).json({ message: 'Image deleted successfully' });
    } catch (error) {
        console.error('Delete image error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const addEvent = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { eventType, payload } = req.body;
        const userId = getAuthenticatedUserId(req);

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (!eventType || !payload) {
            return res.status(400).json({ error: 'Missing event type or payload' });
        }

        const watch = await prisma.watch.findFirst({
            where: { id: Number(id), ownerId: userId },
            select: { id: true, serialNumberHash: true },
        });

        if (!watch) {
            return res.status(404).json({ error: 'Watch not found' });
        }

        const payloadJson = canonicalJsonStringify(payload);
        const payloadHash = sha256Hex(payloadJson);

        // 1. Create event in DB first (pending state)
        const event = await prisma.watchEvent.create({
            data: {
                watchId: watch.id,
                eventType,
                payloadJson,
                payloadHash,
                anchorStatus: initialAnchorStatus(eventType),
            },
        });

        // 2. Anchor to blockchain
        try {
            if (!env.blockchainEnabled || event.anchorStatus === 'NOT_REQUIRED') {
                return res.status(201).json(event);
            }

            const updatedEvent = await anchorEventProof({
                eventId: event.id,
                eventUid: event.eventUid,
                watchCommitment: watch.serialNumberHash,
                eventType,
                payloadHash,
                schemaVersion: event.schemaVersion,
            });

            res.status(201).json(updatedEvent);

        } catch (chainError) {
            console.error('Blockchain anchoring failed:', chainError);
            // Return the event anyway, but it will lack txHash (Pending state in UI)
            const failedEvent = await prisma.watchEvent.findUnique({ where: { id: event.id } });
            res.status(201).json(failedEvent ?? event);
        }

    } catch (error) {
        console.error('Add event error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const allowedContractMimeTypes = new Set([
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
]);

export const uploadContractDocument = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = getAuthenticatedUserId(req);
        const file = req.file;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (!file) {
            return res.status(400).json({ error: 'No contract file provided' });
        }

        if (!allowedContractMimeTypes.has(file.mimetype)) {
            return res.status(400).json({ error: 'Only PDF and image contract files are allowed' });
        }

        const watch = await prisma.watch.findFirst({
            where: { id: Number(id), ownerId: userId },
            select: { id: true, publicId: true, serialNumberHash: true },
        });

        if (!watch) {
            return res.status(404).json({ error: 'Watch not found' });
        }

        const checksumSha256 = sha256Hex(file.buffer);
        const blob = await storePrivateBlob({
            buffer: file.buffer,
            contentType: file.mimetype,
            filename: file.originalname,
            pathnamePrefix: `watches/${watch.publicId}/contracts`,
        });

        const uriHash = sha256Hex(blob.pathname);
        const payload = {
            documentHash: checksumSha256,
            filename: file.originalname,
            mimeType: file.mimetype,
            sizeBytes: file.size,
            storageProvider: 'vercel_blob',
            uriHash,
            uploadedBy: userId,
        };
        const payloadJson = canonicalJsonStringify(payload);
        const payloadHash = sha256Hex(payloadJson);

        const event = await prisma.watchEvent.create({
            data: {
                watchId: watch.id,
                eventType: 'CONTRACT_UPLOADED',
                payloadJson,
                payloadHash,
                documentHash: checksumSha256,
                uriHash,
                anchorStatus: initialAnchorStatus('CONTRACT_UPLOADED'),
                files: {
                    create: {
                        watchId: watch.id,
                        uploadedById: userId,
                        url: blob.url,
                        storageProvider: 'vercel_blob',
                        storageKey: blob.pathname,
                        type: 'contract',
                        mimeType: file.mimetype,
                        sizeBytes: file.size,
                        checksumSha256,
                        visibility: 'PRIVATE',
                    },
                },
            },
            include: { files: true },
        });

        try {
            if (!env.blockchainEnabled || event.anchorStatus === 'NOT_REQUIRED') {
                return res.status(201).json(event);
            }

            const updatedEvent = await anchorEventProof({
                eventId: event.id,
                eventUid: event.eventUid,
                watchCommitment: watch.serialNumberHash,
                eventType: event.eventType,
                payloadHash,
                documentHash: checksumSha256,
                uriHash,
                schemaVersion: event.schemaVersion,
            });

            const eventWithFiles = await prisma.watchEvent.findUnique({
                where: { id: updatedEvent?.id ?? event.id },
                include: { files: true },
            });

            return res.status(201).json(eventWithFiles ?? updatedEvent ?? event);
        } catch (chainError) {
            console.error('Contract blockchain anchoring failed:', chainError);
            const failedEvent = await prisma.watchEvent.findUnique({
                where: { id: event.id },
                include: { files: true },
            });
            return res.status(201).json(failedEvent ?? event);
        }
    } catch (error) {
        console.error('Upload contract error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
