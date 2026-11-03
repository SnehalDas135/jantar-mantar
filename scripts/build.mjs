// Build the deployable, scrambled site into public/.
//
//   node scripts/build.mjs
//
// 1. If the plaintext source isn't present (e.g. a fresh Vercel checkout that only has the
//    encrypted vault), decrypt vault/bundle.enc into src/ using DEPLOY_PRIVATE_KEY.
// 2. Copy the non-secret static assets into public/.
// 3. Bundle each entry point and run it through the obfuscator, writing the scrambled result
//    into public/. The real source never reaches public/.

import fs from 'node:fs';
import path from 'node:path';
import esbuild from 'esbuild';
import obfuscator from 'javascript-obfuscator';
import { open } from './lib/crypto.mjs';
import { secretFiles, ENTRIES, ROOT } from './lib/manifest.mjs';

const P = (...p) => path.join(ROOT, ...p);
const log = (...a) => console.log('[build]', ...a);

// ---- 1. make sure the plaintext source exists, decrypting the vault if it doesn't
function ensureSource() {
  const present = secretFilesExist();
  if (present) { log('using plaintext source in src/'); return; }

  const vaultPath = P('vault', 'bundle.enc');
  if (!fs.existsSync(vaultPath)) throw new Error('No src/ and no vault/bundle.enc to decrypt.');
  const keyB64 = process.env.DEPLOY_PRIVATE_KEY;
  if (!keyB64) throw new Error('src/ is encrypted but DEPLOY_PRIVATE_KEY is not set.');

  const privateKey = Buffer.from(keyB64.trim(), 'base64').toString('utf8');
  const vault = JSON.parse(fs.readFileSync(vaultPath, 'utf8'));
  const files = open(vault, privateKey);
  for (const [rel, contents] of Object.entries(files)) {
    const full = P(rel);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, contents);
  }
  log(`decrypted ${Object.keys(files).length} source files from the vault`);
}

function secretFilesExist() {
  // The game entry is enough to tell whether the plaintext source is already here.
  return fs.existsSync(P('src', 'game', 'main.js'));
}

// ---- 2. copy the non-secret static assets (everything served except the bundled JS)
const SKIP = new Set(['game', 'controller.js']); // handled by the bundler instead
function copyAssets() {
  fs.rmSync(P('public'), { recursive: true, force: true });
  const walk = (relDir) => {
    for (const name of fs.readdirSync(P('src', relDir))) {
      const rel = path.join(relDir, name);
      // skip the secret JS: the whole game/ dir and controller/controller.js
      if (relDir === '' && name === 'game') continue;
      if (rel === path.join('controller', 'controller.js')) continue;
      const full = P('src', rel);
      if (fs.statSync(full).isDirectory()) { fs.mkdirSync(P('public', rel), { recursive: true }); walk(rel); }
      else { fs.mkdirSync(P('public', relDir), { recursive: true }); fs.copyFileSync(full, P('public', rel)); }
    }
  };
  walk('');
  log('copied static assets to public/');
}

// ---- 3. bundle + obfuscate each entry point
const OBFUSCATE = {
  compact: true,
  controlFlowFlattening: true,
  controlFlowFlatteningThreshold: 0.5,   // moderate: this is a 60fps game, keep hot loops fast
  deadCodeInjection: false,
  identifierNamesGenerator: 'hexadecimal',
  numbersToExpressions: true,
  simplify: true,
  transformObjectKeys: true,
  stringArray: true,
  stringArrayEncoding: ['base64'],
  stringArrayThreshold: 0.8,
  stringArrayWrappersCount: 2,
  stringArrayWrappersType: 'function',
  selfDefending: true,                   // breaks if someone re-formats or steps through it
  disableConsoleOutput: true,
  renameGlobals: false,                  // must not rename the vendor globals (Peer, mqtt, QRCode)
};

async function buildEntries() {
  for (const e of ENTRIES) {
    const bundled = await esbuild.build({
      entryPoints: [P(e.in)],
      bundle: true,
      format: e.format,
      platform: 'browser',
      target: 'es2020',
      minify: true,
      legalComments: 'none',
      write: false,
    });
    const code = bundled.outputFiles[0].text;
    const scrambled = obfuscator.obfuscate(code, OBFUSCATE).getObfuscatedCode();
    const outFull = P(e.out);
    fs.mkdirSync(path.dirname(outFull), { recursive: true });
    fs.writeFileSync(outFull, scrambled);
    log(`${e.in} -> ${e.out}  (${(scrambled.length / 1024).toFixed(0)} KB)`);
  }
}

async function main() {
  ensureSource();
  copyAssets();
  await buildEntries();
  log('done.');
}

main().catch((err) => { console.error('[build] FAILED:', err.message); process.exit(1); });
