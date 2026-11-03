// Encrypt the secret source into vault/bundle.enc.
//
//   node scripts/seal.mjs
//
// Run this after editing any first-party game/controller JS, before committing. The plaintext
// source stays only in src/ (git-ignored); the committed repo carries just the encrypted vault.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { seal } from './lib/crypto.mjs';
import { secretFiles, ROOT } from './lib/manifest.mjs';

const pubPath = path.join(ROOT, 'keys', 'deploy.pub.pem');
if (!fs.existsSync(pubPath)) {
  console.error('Missing keys/deploy.pub.pem. Run: node scripts/keygen.mjs');
  process.exit(1);
}
const publicKey = fs.readFileSync(pubPath, 'utf8');

const files = {};
const list = secretFiles();
for (const rel of list) files[rel] = fs.readFileSync(path.join(ROOT, rel), 'utf8');

const vault = seal(files, publicKey);
const outPath = path.join(ROOT, 'vault', 'bundle.enc');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(vault));

console.log(`Sealed ${list.length} files into vault/bundle.enc (${(JSON.stringify(vault).length / 1024).toFixed(1)} KB).`);
console.log('Commit vault/bundle.enc and keys/deploy.pub.pem. Do NOT commit src/.');
