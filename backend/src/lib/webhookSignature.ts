import crypto from 'node:crypto';

/**
 * Compare HMAC-SHA256 du corps brut avec l’en-tête fourni (hex, ou préfixe sha256=, ou format k=v,k2=v2).
 */
export function verifyHmacSha256Hex(
  secret: string,
  rawBody: Buffer | string,
  headerValue: string | string[] | undefined
): boolean {
  if (!headerValue) return false;
  const header = Array.isArray(headerValue) ? headerValue[0] : headerValue;
  const expectedHex = extractHexSignature(header);
  if (!expectedHex) return false;
  const bodyBuf = typeof rawBody === 'string' ? Buffer.from(rawBody, 'utf8') : rawBody;
  const hmac = crypto.createHmac('sha256', secret).update(bodyBuf).digest('hex');
  try {
    const a = Buffer.from(hmac, 'utf8');
    const b = Buffer.from(expectedHex.toLowerCase(), 'utf8');
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

function extractHexSignature(header: string): string | null {
  const h = header.trim();
  if (!h) return null;
  const lower = h.toLowerCase();
  if (lower.includes('=')) {
    const parts = h.split(',');
    for (const p of parts) {
      const idx = p.indexOf('=');
      if (idx === -1) continue;
      const key = p.slice(0, idx).trim().toLowerCase();
      const val = p.slice(idx + 1).trim();
      if ((key === 'v1' || key === 'sig' || key.endsWith('signature')) && /^[0-9a-f]+$/i.test(val)) {
        return val;
      }
    }
  }
  const stripped = h.replace(/^sha256=/i, '').trim();
  if (/^[0-9a-f]+$/i.test(stripped)) return stripped;
  return null;
}
