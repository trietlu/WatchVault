import type { Request, Response } from 'express';
import prisma from '../prisma.js';
import { createHash } from 'crypto';
import { getContract } from '../config/contract.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to hash serial number
const hashSerial = (serial: string) => {
    return createHash('sha256').update(serial).digest('hex');
};

export const createWatch = async (req: Request, res: Response) => {
    try {
        const { brand, model, serialNumber } = req.body;
        // @ts-ignore - userId is added by auth middleware
        const userId = req.user?.userId;
        // @ts-ignore - file is added by multer
        const file = req.file;

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

        const watch = await prisma.watch.create({
            data: {
                brand,
                model,
                serialNumberHash,
                ownerId: userId,
            },
        });

        // If image was uploaded, save it to FileRecord
        if (file) {
            const imageUrl = `/uploads/watches/${file.filename}`;
            await prisma.fileRecord.create({
                data: {
                    watchId: watch.id,
                    url: imageUrl,
                    type: 'image',
                },
            });
        }

        // Generate QR Code URL (mock for now, or just the public URL)
        const qrCodeUrl = `https://watchvault.com/p/${watch.publicId}`;
        await prisma.watch.update({
            where: { id: watch.id },
            data: { qrCodeUrl },
        });

        // Record MINT event
        const payload = { brand, model, serialNumberHash, mintedBy: userId };
        const payloadJson = JSON.stringify(payload);
        const payloadHash = createHash('sha256').update(payloadJson).digest('hex');

        await prisma.watchEvent.create({
            data: {
                watchId: watch.id,
                eventType: 'MINT',
                payloadJson,
                payloadHash,
            },
        });

        res.status(201).json({ watch, qrCodeUrl });
    } catch (error) {
        console.error('Create watch error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getWatches = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user?.userId;
        const watches = await prisma.watch.findMany({
            where: { ownerId: userId },
            include: { events: true },
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
        const watch = await prisma.watch.findUnique({
            where: { id: Number(id) },
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
    try {
        const { id } = req.params;
        // @ts-ignore - file is added by multer
        const file = req.file;

        if (!file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        const watch = await prisma.watch.findUnique({
            where: { id: Number(id) },
            include: { files: true },
        });

        if (!watch) {
            return res.status(404).json({ error: 'Watch not found' });
        }

        // Check if watch already has an image
        if (watch.files.length > 0) {
            return res.status(400).json({ error: 'Watch already has an image. Delete the existing image first.' });
        }

        const imageUrl = `/uploads/watches/${file.filename}`;
        const fileRecord = await prisma.fileRecord.create({
            data: {
                watchId: watch.id,
                url: imageUrl,
                type: 'image',
            },
        });

        res.status(201).json(fileRecord);
    } catch (error) {
        console.error('Upload image error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const deleteWatchImage = async (req: Request, res: Response) => {
    try {
        const { id, fileId } = req.params;

        const fileRecord = await prisma.fileRecord.findUnique({
            where: { id: Number(fileId) },
        });

        if (!fileRecord || fileRecord.watchId !== Number(id)) {
            return res.status(404).json({ error: 'Image not found' });
        }

        // Delete file from filesystem
        const filePath = path.join(__dirname, '..', fileRecord.url);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
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

        if (!eventType || !payload) {
            return res.status(400).json({ error: 'Missing event type or payload' });
        }

        const payloadJson = JSON.stringify(payload);
        const payloadHash = createHash('sha256').update(payloadJson).digest('hex');

        // 1. Create event in DB first (pending state)
        const event = await prisma.watchEvent.create({
            data: {
                watchId: Number(id),
                eventType,
                payloadJson,
                payloadHash,
            },
        });

        // 2. Anchor to blockchain
        try {
            const watch = await prisma.watch.findUnique({ where: { id: Number(id) } });
            if (!watch) throw new Error('Watch not found');

            const contract = getContract() as any;

            // Map eventType string to uint8 (MINT=0, SERVICE=1, TRANSFER=2, AUTH=3, NOTE=4)
            // This mapping should be consistent with the contract or shared constants
            // For MVP, let's assume a simple mapping or just pass 1 for now if contract logic isn't strict
            // Actually, let's define a mapping:
            const eventTypeMap: Record<string, number> = {
                'MINT': 0,
                'SERVICE': 1,
                'TRANSFER': 2,
                'AUTH': 3,
                'NOTE': 4
            };
            const eventTypeId = eventTypeMap[eventType] ?? 4; // Default to NOTE

            const tx = await contract.recordEvent(
                '0x' + watch.serialNumberHash,
                eventTypeId,
                '0x' + payloadHash
            );

            console.log(`Transaction sent: ${tx.hash}`);

            // Wait for confirmation (optional, but good for MVP immediate feedback)
            const receipt = await tx.wait();

            // 3. Update DB with txHash
            await prisma.watchEvent.update({
                where: { id: event.id },
                data: {
                    txHash: tx.hash,
                    blockNumber: receipt.blockNumber
                },
            });

            // Return updated event
            const updatedEvent = await prisma.watchEvent.findUnique({ where: { id: event.id } });
            res.status(201).json(updatedEvent);

        } catch (chainError) {
            console.error('Blockchain anchoring failed:', chainError);
            // Return the event anyway, but it will lack txHash (Pending state in UI)
            res.status(201).json(event);
        }

    } catch (error) {
        console.error('Add event error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
