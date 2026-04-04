import type { Request, Response, NextFunction } from 'express';
import { createClerkClient, verifyToken } from '@clerk/backend';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import prisma from '../prisma.js';

const clerkClient = env.clerkSecretKey
    ? createClerkClient({ secretKey: env.clerkSecretKey })
    : null;

const resolveClerkEmail = async (clerkUserId: string) => {
    if (!clerkClient) {
        return null;
    }

    const clerkUser = await clerkClient.users.getUser(clerkUserId);
    const primaryEmail = clerkUser.emailAddresses.find(
        (email) => email.id === clerkUser.primaryEmailAddressId
    )?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress;

    if (!primaryEmail) {
        return null;
    }

    const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || undefined;
    let user = await prisma.user.findUnique({
        where: { email: primaryEmail },
    });

    if (!user) {
        user = await prisma.user.create({
            data: {
                email: primaryEmail,
                ...(name ? { name } : {}),
            },
        });
    } else if (name && user.name !== name) {
        user = await prisma.user.update({
            where: { id: user.id },
            data: { name },
        });
    }

    return user;
};

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    try {
        const user = jwt.verify(token, env.jwtSecret) as { userId: number };
        req.user = user;
        return next();
    } catch {
        if (!env.clerkSecretKey || !clerkClient) {
            return res.status(403).json({ error: 'Invalid token' });
        }

        try {
            const claims = await verifyToken(token, {
                secretKey: env.clerkSecretKey,
                authorizedParties: [env.appBaseUrl],
            });

            if (!claims.sub) {
                return res.status(403).json({ error: 'Invalid token' });
            }

            const user = await resolveClerkEmail(claims.sub);
            if (!user) {
                return res.status(403).json({ error: 'Invalid token' });
            }

            req.user = { userId: user.id };
            return next();
        } catch {
            return res.status(403).json({ error: 'Invalid token' });
        }
    }
};
