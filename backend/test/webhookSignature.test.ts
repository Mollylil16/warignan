import crypto from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { verifyHmacSha256Hex } from '../src/lib/webhookSignature.js';

function sign(secret: string, body: string): string {
  return crypto.createHmac('sha256', secret).update(body, 'utf8').digest('hex');
}

describe('verifyHmacSha256Hex', () => {
  const SECRET = 'super-secret-key';
  const BODY = '{"event":"payment.success"}';

  it('valide une signature hex correcte', () => {
    const sig = sign(SECRET, BODY);
    expect(verifyHmacSha256Hex(SECRET, BODY, sig)).toBe(true);
  });

  it('valide avec préfixe sha256=', () => {
    const sig = `sha256=${sign(SECRET, BODY)}`;
    expect(verifyHmacSha256Hex(SECRET, BODY, sig)).toBe(true);
  });

  it('valide avec format v1=<hex>', () => {
    const sig = `v1=${sign(SECRET, BODY)}`;
    expect(verifyHmacSha256Hex(SECRET, BODY, sig)).toBe(true);
  });

  it('valide avec format sig=<hex>', () => {
    const sig = `sig=${sign(SECRET, BODY)}`;
    expect(verifyHmacSha256Hex(SECRET, BODY, sig)).toBe(true);
  });

  it('valide avec signature dans un tableau (premier élément)', () => {
    const sig = sign(SECRET, BODY);
    expect(verifyHmacSha256Hex(SECRET, BODY, [sig, 'ignored'])).toBe(true);
  });

  it('valide avec un Buffer comme corps', () => {
    const buf = Buffer.from(BODY, 'utf8');
    const sig = sign(SECRET, BODY);
    expect(verifyHmacSha256Hex(SECRET, buf, sig)).toBe(true);
  });

  it('rejette une signature incorrecte', () => {
    const sig = sign(SECRET, BODY).replace(/^./, 'f');
    expect(verifyHmacSha256Hex(SECRET, BODY, sig)).toBe(false);
  });

  it('rejette si header absent', () => {
    expect(verifyHmacSha256Hex(SECRET, BODY, undefined)).toBe(false);
  });

  it('rejette si header vide', () => {
    expect(verifyHmacSha256Hex(SECRET, BODY, '')).toBe(false);
  });

  it('rejette avec mauvais secret', () => {
    const sig = sign('wrong-secret', BODY);
    expect(verifyHmacSha256Hex(SECRET, BODY, sig)).toBe(false);
  });

  it('rejette si corps différent', () => {
    const sig = sign(SECRET, BODY + ' ');
    expect(verifyHmacSha256Hex(SECRET, BODY, sig)).toBe(false);
  });

  it('est insensible à la casse du hex', () => {
    const sig = sign(SECRET, BODY).toUpperCase();
    expect(verifyHmacSha256Hex(SECRET, BODY, sig)).toBe(true);
  });
});
