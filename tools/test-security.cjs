'use strict';

const assert = require('assert');
const {
  validateHttpsUrl,
  assertAllowedSourceUrl,
  getRequestLimits,
  getAllowedSourceHosts
} = require('../electron/security.cjs');

function expectThrow(fn, message) {
  assert.throws(fn, message);
}

// =====================================================
// 1. Approved HTTPS source URLs
// =====================================================

assert.strictEqual(
  assertAllowedSourceUrl('https://www.forexfactory.com/calendar').hostname,
  'www.forexfactory.com'
);

assert.strictEqual(
  assertAllowedSourceUrl('https://nfs.faireconomy.media/ff_calendar_thisweek.json').hostname,
  'nfs.faireconomy.media'
);

assert.strictEqual(
  assertAllowedSourceUrl('https://www.bls.gov/data/').hostname,
  'www.bls.gov'
);

assert.strictEqual(
  assertAllowedSourceUrl('https://download.bls.gov/').hostname,
  'download.bls.gov'
);

assert.strictEqual(
  assertAllowedSourceUrl('https://raw.githubusercontent.com/petermacro/macro-engine-desktop/main/data/catalog.json').hostname,
  'raw.githubusercontent.com'
);

// =====================================================
// 2. Unsafe protocols must be blocked
// =====================================================

expectThrow(
  () => assertAllowedSourceUrl('http://www.forexfactory.com/calendar'),
  /Only HTTPS URLs are permitted/
);

expectThrow(
  () => assertAllowedSourceUrl('ftp://www.forexfactory.com/file'),
  /Only HTTPS URLs are permitted/
);

// =====================================================
// 3. Unapproved hosts must be blocked
// =====================================================

expectThrow(
  () => assertAllowedSourceUrl('https://example.com/data.json'),
  /Source host is not approved/
);

expectThrow(
  () => assertAllowedSourceUrl('https://evil.example.com/'),
  /Source host is not approved/
);

// =====================================================
// 4. Embedded credentials must be blocked
// =====================================================

expectThrow(
  () => validateHttpsUrl('https://user:password@www.forexfactory.com/calendar'),
  /embedded credentials/
);

// =====================================================
// 5. Invalid / empty URLs must be blocked
// =====================================================

expectThrow(
  () => validateHttpsUrl(''),
  /URL is required/
);

expectThrow(
  () => validateHttpsUrl('not-a-url'),
  /Invalid URL/
);

// =====================================================
// 6. Request timeout limits
// =====================================================

assert.strictEqual(
  getRequestLimits({}).timeoutMs,
  30000
);

assert.strictEqual(
  getRequestLimits({ timeoutMs: 500 }).timeoutMs,
  1000
);

assert.strictEqual(
  getRequestLimits({ timeoutMs: 999999 }).timeoutMs,
  120000
);

// =====================================================
// 7. Response-size limits
// =====================================================

assert.strictEqual(
  getRequestLimits({}).maxResponseBytes,
  5 * 1024 * 1024
);

assert.strictEqual(
  getRequestLimits({ maxResponseBytes: 100 }).maxResponseBytes,
  1024
);

assert.strictEqual(
  getRequestLimits({ maxResponseBytes: 999999999 }).maxResponseBytes,
  20 * 1024 * 1024
);

// =====================================================
// 8. Approved-host list sanity check
// =====================================================

const hosts = getAllowedSourceHosts();

assert(hosts.includes('www.forexfactory.com'));
assert(hosts.includes('nfs.faireconomy.media'));
assert(hosts.includes('www.bls.gov'));
assert(hosts.includes('download.bls.gov'));
assert(hosts.includes('raw.githubusercontent.com'));

console.log(JSON.stringify({
  ok: true,
  tests: [
    'approved HTTPS hosts',
    'unsafe protocols blocked',
    'unapproved hosts blocked',
    'embedded credentials blocked',
    'invalid URLs blocked',
    'timeout bounds',
    'response-size bounds',
    'approved-host list'
  ],
  message: 'Central security regression test PASS.'
}, null, 2));