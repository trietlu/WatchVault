import test from 'node:test';
import assert from 'node:assert/strict';
import { toPublicPassport } from './public-passport.js';

test('toPublicPassport strips owner data and private payloads', () => {
    const timestamp = new Date('2026-02-28T12:00:00.000Z');
    const serialized = toPublicPassport({
        brand: 'Rolex',
        model: 'Submariner',
        publicId: 'public-id',
        ownerId: 42,
        events: [
            {
                eventType: 'SERVICE',
                timestamp,
                txHash: '0x123',
                blockNumber: 10,
                payloadHash: 'hash',
                payloadJson: '{"description":"private"}',
            },
        ],
    });

    assert.equal('ownerId' in serialized, false);
    assert.ok(serialized.events[0]);
    assert.equal('payloadJson' in serialized.events[0], false);
    assert.equal(serialized.events[0].payloadHash, 'hash');
});
