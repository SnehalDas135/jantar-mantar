// Generate the deploy keypair.
//
//   node scripts/keygen.mjs
//
// Writes the PUBLIC key to keys/deploy.pub.pem (commit this) and prints the PRIVATE key as a
// single base64 line to paste into Vercel as the DEPLOY_PRIVATE_KEY environment variable.
// The private key is never written to disk and must never be committed. Run this once; running
// it again makes a new key that can't open vaults sealed with the old one.

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pubPath = path.join(root, 'keys', 'deploy.pub.pem');

if (fs.existsSync(pubPath) && !process.argv.includes('--force')) {
  console.error('keys/deploy.pub.pem already exists. Re-run with --force to overwrite (old vaults become unreadable).');
  process.exit(1);
}

const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 4096,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});

fs.mkdirSync(path.dirname(pubPath), { recursive: true });
fs.writeFileSync(pubPath, publicKey);

const b64 = Buffer.from(privateKey, 'utf8').toString('base64');

console.log('Public key written to keys/deploy.pub.pem  (commit this file).\n');
console.log('Add this to Vercel  →  Settings  →  Environment Variables');
console.log('  Name:  DEPLOY_PRIVATE_KEY');
console.log('  Value (one line, base64 of the PEM):\n');
console.log(b64);
console.log('\nKeep this value secret. It is not saved anywhere on disk.');
