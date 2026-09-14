'use strict';

/**
 * Macro Engine Desktop — Central Security Layer v1
 *
 * Purpose:
 * - Allow only explicitly approved HTTPS source hosts.
 * - Reject unsafe protocols and malformed URLs.
 * - Provide shared network safety limits for future data adapters.
 * - Do not bypass CAPTCHA, anti-bot, authentication, paywalls,
 *   rate limits, or other access controls.
 *
 * This module does not fetch data by itself.
 */

const ALLOWED_SOURCE_HOSTS = new Set([
  'www.forexfactory.com',
  'nfs.faireconomy.media',
  'www.bls.gov',
  'download.bls.gov',
  'raw.githubusercontent.com'
]);

const DEFAULT_REQUEST_TIMEOUT_MS = 30_000;
const DEFAULT_MAX_RESPONSE_BYTES = 5 * 1024 * 1024;

function clean(value) {
  return value === null || value === undefined
    ? ''
    : String(value).trim();
}

function validateHttpsUrl(value) {
  const raw = clean(value);

  if (!raw) {
    throw new Error('URL is required.');
  }

  let url;

  try {
    url = new URL(raw);
  } catch {
    throw new Error('Invalid URL.');
  }

  if (url.protocol !== 'https:') {
    throw new Error('Only HTTPS URLs are permitted.');
  }

  if (url.username || url.password) {
    throw new Error('URLs containing embedded credentials are not permitted.');
  }

  if (!url.hostname) {
    throw new Error('URL hostname is missing.');
  }

  return url;
}

function assertAllowedSourceUrl(value) {
  const url = validateHttpsUrl(value);
  const hostname = url.hostname.toLowerCase();

  if (!ALLOWED_SOURCE_HOSTS.has(hostname)) {
    throw new Error(`Source host is not approved: ${hostname}`);
  }

  return url;
}

function getRequestLimits(options = {}) {
  const timeoutMs = Number.isFinite(options.timeoutMs)
    ? Math.max(1_000, Math.min(options.timeoutMs, 120_000))
    : DEFAULT_REQUEST_TIMEOUT_MS;

  const maxResponseBytes = Number.isFinite(options.maxResponseBytes)
    ? Math.max(1_024, Math.min(options.maxResponseBytes, 20 * 1024 * 1024))
    : DEFAULT_MAX_RESPONSE_BYTES;

  return {
    timeoutMs,
    maxResponseBytes
  };
}

function getAllowedSourceHosts() {
  return [...ALLOWED_SOURCE_HOSTS];
}

module.exports = {
  ALLOWED_SOURCE_HOSTS,
  DEFAULT_REQUEST_TIMEOUT_MS,
  DEFAULT_MAX_RESPONSE_BYTES,
  validateHttpsUrl,
  assertAllowedSourceUrl,
  getRequestLimits,
  getAllowedSourceHosts
};
