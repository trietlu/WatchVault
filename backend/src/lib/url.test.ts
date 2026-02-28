import test from 'node:test';
import assert from 'node:assert/strict';
import { buildAbsoluteUrl } from './url.js';

test('buildAbsoluteUrl joins base urls and relative paths', () => {
    assert.equal(
        buildAbsoluteUrl('http://localhost:3001', '/uploads/watches/file.jpg'),
        'http://localhost:3001/uploads/watches/file.jpg'
    );
});

test('buildAbsoluteUrl preserves nested paths without duplicate slashes', () => {
    assert.equal(
        buildAbsoluteUrl('http://localhost:3000/', 'p/public-id'),
        'http://localhost:3000/p/public-id'
    );
});
