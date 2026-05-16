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
    assert.equal(resolved.chainEnvironment, 'preview');
    assert.equal(resolved.chainRpcUrl, 'https://sepolia.base.org');
    assert.equal(resolved.chainId, 84532);
});

test('readEnv requires blockchain settings when blockchain is enabled', () => {
    assert.throws(
        () => readEnv({
            JWT_SECRET: 'test-secret',
            BLOCKCHAIN_ENABLED: 'true',
        }),
        /CHAIN_PRIVATE_KEY is required/
    );
});

test('readEnv rejects preview chain id mismatch', () => {
    assert.throws(
        () => readEnv({
            JWT_SECRET: 'test-secret',
            BLOCKCHAIN_ENABLED: 'true',
            CHAIN_RPC_URL: 'https://mainnet.base.org',
            CHAIN_PRIVATE_KEY: '0xabc',
            CHAIN_CONTRACT_ADDRESS: '0x123',
            CHAIN_ID: '8453',
        }),
        /Preview blockchain must use Base Sepolia CHAIN_ID=84532/
    );
});

test('readEnv resolves production chain defaults', () => {
    const resolved = readEnv({
        JWT_SECRET: 'test-secret',
        VERCEL_ENV: 'production',
    });

    assert.equal(resolved.chainEnvironment, 'production');
    assert.equal(resolved.chainNetworkName, 'base-mainnet');
    assert.equal(resolved.chainRpcUrl, 'https://mainnet.base.org');
    assert.equal(resolved.chainId, 8453);
});
