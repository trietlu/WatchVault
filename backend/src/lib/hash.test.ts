import test from 'node:test';
import assert from 'node:assert/strict';
import { canonicalJsonStringify, sha256Hex, toBytes32 } from './hash.js';

test('canonicalJsonStringify sorts object keys recursively', () => {
    const first = canonicalJsonStringify({
        b: 2,
        a: { d: 4, c: 3 },
    });
    const second = canonicalJsonStringify({
        a: { c: 3, d: 4 },
        b: 2,
    });

    assert.equal(first, second);
    assert.equal(first, '{"a":{"c":3,"d":4},"b":2}');
});

test('toBytes32 validates hashes before chain submission', () => {
    const hash = sha256Hex('proof');

    assert.equal(toBytes32(hash), `0x${hash}`);
    assert.throws(() => toBytes32('abc'), /Expected a 32-byte hex string/);
});
