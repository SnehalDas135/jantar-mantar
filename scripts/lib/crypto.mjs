// Hybrid encryption for the source vault.
//
// The secret source files are packed into one gzipped JSON manifest, encrypted with a fresh
// AES-256-GCM key, and that AES key is itself encrypted with the deploy RSA public key
// (RSA-OAEP / SHA-256). Only the matching private key — held by Vercel as an env var — can
// recover the AES key and therefore the source. The public key alone can seal but never open.

import crypto from 'node:crypto';
import zlib from 'node:zlib';

// Seal a { path: utf8-contents } map into a self-contained vault object (all base64 strings).
export function seal(files, publicKeyPem) {
  const manifest = Buffer.from(JSON.stringify(files), 'utf8');
  const packed = zlib.gzipSync(manifest, { level: 9 });

  const aesKey = crypto.randomBytes(32);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', aesKey, iv);
  const ciphertext = Buffer.concat([cipher.update(packed), cipher.final()]);
  const tag = cipher.getAuthTag();

  const encKey = crypto.publicEncrypt(
    { key: publicKeyPem, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256' },
    aesKey,
  );

  return {
    v: 1,
    alg: 'RSA-OAEP-SHA256 + AES-256-GCM + gzip',
    key: encKey.toString('base64'),
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
    data: ciphertext.toString('base64'),
  };
}

// Open a vault object with the private key, returning the { path: contents } map.
export function open(vault, privateKeyPem) {
  const aesKey = crypto.privateDecrypt(
    { key: privateKeyPem, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256' },
    Buffer.from(vault.key, 'base64'),
  );
  const decipher = crypto.createDecipheriv('aes-256-gcm', aesKey, Buffer.from(vault.iv, 'base64'));
  decipher.setAuthTag(Buffer.from(vault.tag, 'base64'));
  const packed = Buffer.concat([decipher.update(Buffer.from(vault.data, 'base64')), decipher.final()]);
  const manifest = zlib.gunzipSync(packed);
  return JSON.parse(manifest.toString('utf8'));
}
