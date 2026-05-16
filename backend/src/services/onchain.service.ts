import prisma from '../prisma.js';
import { env } from '../config/env.js';
import { CONTRACT_ADDRESS, assertConfiguredChain, getContract } from '../config/contract.js';
import { sha256Hex, toBytes32 } from '../lib/hash.js';

export const ANCHOR_STATUS = {
    NOT_REQUIRED: 'NOT_REQUIRED',
    PENDING: 'PENDING',
    SUBMITTED: 'SUBMITTED',
    ANCHORED: 'ANCHORED',
    FAILED_RETRYABLE: 'FAILED_RETRYABLE',
    FAILED_FINAL: 'FAILED_FINAL',
} as const;

export const EVENT_TYPE_ID: Record<string, number> = {
    MINT: 0,
    SERVICE: 1,
    TRANSFER: 2,
    AUTH: 3,
    NOTE: 4,
    CONTRACT_UPLOADED: 5,
    CONTRACT_SIGNED: 6,
    AUTH_REQUEST: 7,
    AUTH_VERDICT: 8,
    TRANSFER_INITIATED: 9,
    TRANSFER_ACCEPTED: 10,
    CORRECTION: 11,
};

const ZERO_BYTES32 = `0x${'0'.repeat(64)}`;

interface AnchorEventInput {
    eventId: number;
    eventUid: string;
    watchCommitment: string;
    eventType: string;
    payloadHash: string;
    documentHash?: string | null;
    uriHash?: string | null;
    schemaVersion?: number;
}

export const initialAnchorStatus = (eventType: string): string => {
    if (!env.blockchainEnabled) {
        return ANCHOR_STATUS.NOT_REQUIRED;
    }

    if (eventType === 'NOTE' || eventType === 'AUTH_REQUEST' || eventType === 'TRANSFER_INITIATED') {
        return ANCHOR_STATUS.NOT_REQUIRED;
    }

    return ANCHOR_STATUS.PENDING;
};

export const anchorEventProof = async (input: AnchorEventInput) => {
    if (!env.blockchainEnabled) {
        return null;
    }

    const eventTypeId = EVENT_TYPE_ID[input.eventType] ?? EVENT_TYPE_ID.NOTE;
    await assertConfiguredChain();
    const contract = getContract() as any;

    await prisma.watchEvent.update({
        where: { id: input.eventId },
        data: {
            anchorStatus: ANCHOR_STATUS.SUBMITTED,
            anchorAttempts: { increment: 1 },
            anchorError: null,
            chainId: env.chainId ?? null,
            contractAddress: CONTRACT_ADDRESS,
        },
    });

    try {
        const eventUidHash = toBytes32(sha256Hex(input.eventUid));
        const tx = await contract.anchorProof(
            toBytes32(input.watchCommitment),
            eventUidHash,
            eventTypeId,
            toBytes32(input.payloadHash),
            input.documentHash ? toBytes32(input.documentHash) : ZERO_BYTES32,
            input.uriHash ? toBytes32(input.uriHash) : ZERO_BYTES32,
            input.schemaVersion ?? 1
        );

        const receipt = await tx.wait();
        const proofLog = receipt.logs?.find((log: any) => {
            return String(log.address).toLowerCase() === CONTRACT_ADDRESS.toLowerCase();
        });

        const updatedEvent = await prisma.watchEvent.update({
            where: { id: input.eventId },
            data: {
                anchorStatus: ANCHOR_STATUS.ANCHORED,
                chainId: env.chainId ?? null,
                contractAddress: CONTRACT_ADDRESS,
                txHash: tx.hash,
                blockNumber: receipt.blockNumber,
                logIndex: proofLog?.index ?? null,
                anchoredAt: new Date(),
                anchorError: null,
            },
        });

        return updatedEvent;
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown blockchain anchoring error';

        await prisma.watchEvent.update({
            where: { id: input.eventId },
            data: {
                anchorStatus: ANCHOR_STATUS.FAILED_RETRYABLE,
                anchorError: message.slice(0, 1000),
            },
        });

        throw error;
    }
};
