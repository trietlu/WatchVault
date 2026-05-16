interface PublicPassportEventInput {
    eventUid?: string;
    eventType: string;
    timestamp: Date;
    txHash: string | null;
    blockNumber: number | null;
    payloadHash: string;
    documentHash?: string | null;
    uriHash?: string | null;
    schemaVersion?: number;
    anchorStatus?: string;
    chainId?: number | null;
    contractAddress?: string | null;
    payloadJson?: string;
}

interface PublicPassportWatchInput {
    ownerId?: number;
    events: PublicPassportEventInput[];
    [key: string]: unknown;
}

export const toPublicPassport = <T extends PublicPassportWatchInput>(watch: T) => {
    const { ownerId: _ownerId, events, ...publicData } = watch;

    return {
        ...publicData,
        events: events.map(({ payloadJson: _payloadJson, ...event }) => event),
    };
};
