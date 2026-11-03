// Which files are secret (encrypted into the vault) and where things live.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

// Everything first-party and worth protecting: the whole game module graph and the controller.
// (Third-party vendor libs, HTML, CSS, audio and fonts are not secret and stay in plaintext.)
export function secretFiles() {
  const out = [];
  const walk = (dir) => {
    for (const name of fs.readdirSync(dir)) {
      const full = path.join(dir, name);
      if (fs.statSync(full).isDirectory()) walk(full);
      else if (name.endsWith('.js')) out.push(path.relative(ROOT, full));
    }
  };
  walk(path.join(ROOT, 'src', 'game'));
  out.push(path.relative(ROOT, path.join(ROOT, 'src', 'controller', 'controller.js')));
  return out.sort();
}

// The two bundle entry points -> their served output paths.
export const ENTRIES = [
  { in: 'src/game/main.js', out: 'public/game/main.js', format: 'esm' },
  { in: 'src/controller/controller.js', out: 'public/controller/controller.js', format: 'iife' },
];
