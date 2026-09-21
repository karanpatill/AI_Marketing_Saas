import { promises as dns } from 'dns';
import { isIP } from 'net';
import { ValidationError } from './errors';

const BLOCKED_HOSTNAMES = new Set(['localhost', 'metadata.google.internal']);
const BLOCKED_SUFFIXES = ['.local', '.internal', '.localhost'];

function isPrivateIPv4(ip: string): boolean {
  const [a, b] = ip.split('.').map(Number);
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    a >= 224
  );
}

function isPrivateIPv6(ip: string): boolean {
  const lower = ip.toLowerCase();
  if (lower === '::' || lower === '::1') return true;
  if (lower.startsWith('::ffff:')) return isPrivateIPv4(lower.slice(7));
  return lower.startsWith('fc') || lower.startsWith('fd') || lower.startsWith('fe80');
}

export function isPrivateAddress(ip: string): boolean {
  const version = isIP(ip);
  if (version === 4) return isPrivateIPv4(ip);
  if (version === 6) return isPrivateIPv6(ip);
  return true;
}

/**
 * Validates that a user-supplied URL is an http(s) URL pointing at a public host.
 * Resolves DNS and rejects anything that lands on loopback, link-local, or RFC1918 space,
 * which is the standard SSRF guard for server-side fetches of untrusted URLs.
 * Returns the normalized URL string.
 */
export async function assertPublicHttpUrl(input: string): Promise<string> {
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    throw new ValidationError('Invalid URL.');
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new ValidationError('Only http and https URLs are allowed.');
  }
  if (url.username || url.password) {
    throw new ValidationError('URLs with credentials are not allowed.');
  }

  const hostname = url.hostname.toLowerCase().replace(/\.$/, '');
  if (BLOCKED_HOSTNAMES.has(hostname) || BLOCKED_SUFFIXES.some((s) => hostname.endsWith(s))) {
    throw new ValidationError('This host is not allowed.');
  }

  if (isIP(hostname)) {
    if (isPrivateAddress(hostname)) throw new ValidationError('This host is not allowed.');
    return url.toString();
  }

  let addresses: { address: string }[];
  try {
    addresses = await dns.lookup(hostname, { all: true });
  } catch {
    throw new ValidationError('Could not resolve host.');
  }

  if (addresses.length === 0 || addresses.some((a) => isPrivateAddress(a.address))) {
    throw new ValidationError('This host is not allowed.');
  }

  return url.toString();
}
