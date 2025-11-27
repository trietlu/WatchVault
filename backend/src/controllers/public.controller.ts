import type { Request, Response } from 'express';
import prisma from '../prisma.js';

export const getPassport = async (req: Request, res: Response) => {
    try {
        const publicId = req.params.publicId;

        if (!publicId) {
            return res.status(400).json({ error: 'Public ID is required' });
        }

        const watch = await prisma.watch.findUnique({
            where: { publicId },
            include: {
                events: {
                    select: {
                        eventType: true,
                        timestamp: true,
                        txHash: true,
                        blockNumber: true,
                        payloadHash: true,
                        // Exclude payloadJson for privacy if needed, or include it if public
                        payloadJson: true,
                    },
                    orderBy: { timestamp: 'desc' },
                },
            },
        });

        if (!watch) {
            return res.status(404).json({ error: 'Passport not found' });
        }

        // Anonymize owner info
        const { ownerId, ...publicData } = watch;

        res.status(200).json(publicData);
    } catch (error) {
        console.error('Get passport error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
