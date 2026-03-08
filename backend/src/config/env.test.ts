import test from 'node:test';
import assert from 'node:assert/strict';
import { readEnv } from './env.js';

test('readEnv requires JWT_SECRET', () => {
    assert.throws(
        () => readEnv({}),
        /JWT_SECRET is required/
    );
});

test('readEnv applies local defaults when optional values are omitted', () => {
    const resolved = readEnv({
        JWT_SECRET: 'test-secret',
    });

    assert.equal(resolved.host, '0.0.0.0');
    assert.equal(resolved.port, 3001);
    assert.equal(resolved.apiBaseUrl, 'http://localhost:3001');
    assert.equal(resolved.appBaseUrl, 'http://localhost:3000');
    assert.equal(resolved.blockchainEnabled, false);
});

test('readEnv requires blockchain settings when blockchain is enabled', () => {
    assert.throws(
        () => readEnv({
            JWT_SECRET: 'test-secret',
            BLOCKCHAIN_ENABLED: 'true',
        }),
        /CHAIN_RPC_URL is required/
    );
});
