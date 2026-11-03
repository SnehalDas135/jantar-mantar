# Jantar Mantar

A retro 2D fighting game for two players on one screen. Each player uses **their phone as the controller**: scan a QR code and a joystick and buttons appear. No app to install.

## Play

**Online:** open **https://jantar-mantar-ruddy.vercel.app** on a laptop or TV. Each player scans their
QR code. Phones can be on any network: they connect directly to the game screen (WebRTC), and fall
back to a relay when a direct link isn't possible (mobile data, VPNs, strict Wi-Fi).

**Locally:**

```bash
npm start
```

This opens `http://localhost:3000`, and the QR codes point at the laptop's Wi-Fi address. The
connection handshake still needs internet.

## Modes

The lobby has two sections:

- **PLAYER vs PLAYER**: two phones, one each.
- **PLAYER vs AI**: one phone against the computer, at **EASY**, **MEDIUM**, **HARD** or **EVM RIGGED**. P1 picks both fighters. Harder levels react faster, block more, punish mistakes, run longer combos, use more of the move tree and dodge specials.
- **BEYOND REALM** (the last vs AI level): the secret final boss, **Gandhi ji**. You pick only your own fighter. He floats down from the sky and gives a speech, then never strikes first and can't be knocked out. Take half his health and he drags you into his purple hell domain. There he turns into **GANDHI FINAL BOSS**: huge and veiny, eyes on fire, health refilled, and armed with a burning stick you can't block. He fights like a titan: a slow, heavy walk and long telegraphed attacks:
  - an overhead slam that sends fire shockwaves along the ground
  - a charging thrust
  - a leap that crashes down where you stand
  - a teleport through fire that reappears behind you
  - a rolling wall of fire
  - a spinning firestorm

  The fight builds through RAGE II and RAGE III, and the domain burns hotter each time. Your hits land but barely scratch him and never stagger him. Beating him is possible in theory, but in practice it's close to impossible.

Switch modes with ←/→ on the laptop or P1's joystick, and change the difficulty with ↑/↓.

**Going back:** press **BLOCK** on character select to return to the main menu. The **☰ MENU** button on any
phone pauses the game anywhere, with Resume, Restart, Character select and Main menu (choose mode). The results
screen also has a **MAIN MENU** option.

## Move Guide

Every move with its controller input, and Modi ji demonstrating it on a dummy. Open it from the lobby
(**📖 MOVE GUIDE**, the **G** key, or ☰ MENU on a phone), or from the pause menu at any time; it doesn't end
the match. Browse with the joystick ↑↓ or arrow keys, press PUNCH to replay, and KICK or BLOCK to close.

## Controls (phone)

| Input | Action |
|---|---|
| Joystick ← → | walk (holding *back* also blocks) |
| Joystick ↑ / ↓ | jump (floaty, ~0.9s) / crouch |
| PUNCH / KICK | jab / front kick |
| → + P, → + K | lunge punch, side kick |
| ← + P, ← + K | spinning backfist, spinning back kick |
| ↓ + P, ↓ + K | uppercut, low sweep |
| P, P, P · K, K | punch combo, kick combo |
| air P / K · air ↓ + K | jump punch / kick · dive kick |
| BLOCK | guard (add ↓ for low; works in the air too) |
| → + BLOCK (close) · ← + BLOCK | throw · evade |
| SPECIAL | the leader's special, once charged |

**No spamming.** Each extra hit in a combo stuns for less time, so long strings drop, and the
6th hit always knocks down. Landing the same move over and over makes it **STALE** (less damage
and stun, until you mix it up or wait 5 seconds). A blocked hit leaves the attacker slightly
behind, and a whiffed normal takes a few extra frames to recover from.

Moves beyond the basics are unlocked in each leader's **move tree** by earning XP (landing hits,
winning rounds and matches). Open it with **T** on the character select screen or from the
Esc menu. Settings → *Moves: all unlocked* skips the grind. Progress is saved on the laptop.

## Specials

Land 5 hits in a row to charge the special, for every leader (the *Fury* unlock makes the special hit 10% harder instead). Getting hit before
the meter is full resets it. Specials are **area attacks**: standing in the core takes the
full hit, and anywhere else (jumping, ducking or running away) still takes ~30% splash damage.

| Leader | Special |
|---|---|
| ★ Modi ji | **Void Meditation**: levitates over a lotus with an OM and diyas while his clip plays; four waves of void beams, ending in a stage-wide finale. Hit him while he's levitating to cancel it. |
| Amit Shah | **Police Detention**: two waves of police officers rush in from both sides and strike with lathis. |
| Yogi | **Bulldozer**: a bulldozer slams its bucket on the opponent and flattens them. |
| Nirmala | **Market Crash**: a *RUPEE CRASHES!* newspaper, a crashing stock chart, then a rain of money. |
| ★ Rahul | **Bharat Jodo Yatra**: Sonia, Priyanka and a crowd with flags and a banner march across and shove the opponent. |
| Mamata | **Tiger Curse**: a voodoo doll of the opponent mauled by spirit tigers; hit her to break the ritual. |
| Akhilesh | **Cycle Sweep**: drops his cycle from the sky, rings the bell and rides across the whole stage twice. |
| Abhijeet Dipke | **Mecha Cockroach**: turns into a giant armoured cockroach for 10 seconds: more damage and reach, takes less damage, light hits don't stun him. |
| Dhruv Rathee | **Fact Check**: *Namaskar dosto!* A giant video screen drops in; the opponent blurts out a claim and three red stamps slam onto them: FALSE, MISLEADING, 100% FAKE NEWS. A **copyright shield** soaks up 3 hits and shoves anyone who walks up to him away; break it, then hit him to demonetise the video. |
| Rajnath | **Tank Strike**: *Hum chhedte nahi... par chhodte bhi nahi!* A tank rolls in, he climbs on top and fires three missiles. A crosshair hunts the opponent and locks on; step away after the lock-on and it misses. Direct hits do 10, 10 and 15 (knockdown). |

Faces are generated from a description of each person's look (`public/game/faces.js` +
`look` in `characters.js`). Summoned specials live in `public/game/specials.js`.
Special audio lives in `public/audio/`: `modi-void.m4a` (1s–11s, played at 1.5×), `rahul-yatra.m4a`
(4s–10s), `mamata-curse.m4a` and `shah-detention.m4a` (played at 1.5×). These specials show no speech bubbles, so only the clip speaks.

## Laptop controls

The fighting is phone-only. The laptop runs the menus:

- **Esc** (or P) opens pause and settings: round time, match length (best of 1/3/5), volume, restart, character select, back to lobby, and disconnect a player's phone.
- **Enter**, the arrow keys and the trackpad work in the lobby, on the results screen and in menus.
- Click once to enable sound. Browsers block audio until you interact with the page.

If a phone locks or drops mid-match, the game pauses and shows that player's QR code. Unlock the phone or scan again to get the same player slot back.

## How it works

- `public/game/net.js` is the phone link. The game screen opens a room (PeerJS/WebRTC), phones connect peer-to-peer, and phones fall back to an MQTT relay (`public.cloud.shiftr.io` on port 443, then `broker.hivemq.com`) when a direct link isn't possible or the PeerJS broker is blocked; the room opens as soon as either answers. `server.js` is only a local static server.
- `public/controller/` is the phone controller page: a floating joystick, multi-touch buttons and vibration.
- `public/game/` is the game. It runs a fixed 60 Hz simulation on a 384×216 pixel-art canvas.
  - `fighter.js` holds the fighter state machine and physics.
  - `combat.js` handles hits, blocking and projectiles.
  - `characters.js` holds each move's frame data.
  - `sprites.js` draws the pixel-art fighters in code.
  - `stage.js` draws the observatory stage.
  - `scenes/` holds the lobby, character select, fight and results screens.

## Source protection (encrypted repo + scrambled build)

The first-party game and controller code is **not stored in plaintext** in this repository.
It is encrypted into a vault and only decrypted at build time by Vercel.

### Layout
- `src/` — the real, readable source (git-ignored; lives only on your machine).
- `vault/bundle.enc` — the encrypted source (committed). Unreadable without the private key.
- `keys/deploy.pub.pem` — the deploy **public** key (committed). Can seal, never open.
- `scripts/` — `keygen.mjs`, `seal.mjs`, `build.mjs` and the crypto helpers.
- `public/` — the built, **obfuscated** site Vercel serves (git-ignored; regenerated each build).

### The keypair
`node scripts/keygen.mjs` creates a 4096-bit RSA keypair. The public key is written to
`keys/deploy.pub.pem`; the private key is printed once as a single base64 line and saved
nowhere. Add it to Vercel as the environment variable **`DEPLOY_PRIVATE_KEY`**
(Project → Settings → Environment Variables, all environments). Only a build holding that
variable can decrypt the vault, so only Vercel can deploy the real code.

### Encryption
`vault/bundle.enc` is a hybrid-encrypted bundle of every first-party `.js` file: the source is
gzipped and sealed with a one-time AES-256-GCM key, and that key is encrypted with the RSA
public key (RSA-OAEP / SHA-256). See `scripts/lib/crypto.mjs`.

### Build
`node scripts/build.mjs` (Vercel's build command):
1. If `src/` is absent, decrypt `vault/bundle.enc` using `DEPLOY_PRIVATE_KEY`.
2. Copy the non-secret static assets (HTML, CSS, audio, fonts, vendor libs) into `public/`.
3. Bundle each entry point with esbuild and run it through `javascript-obfuscator`, writing only
   the scrambled result into `public/`. The readable source never reaches `public/`.

### Everyday workflow
1. Edit files under `src/`.
2. `npm run dev` to build and run locally (`http://localhost:3000`).
3. `npm run seal` to re-encrypt the vault after any source change.
4. Commit `vault/bundle.enc` (and any changed assets). Never commit `src/`.

> The deployed game runs in the browser, so its JavaScript can always be fetched. Obfuscation
> makes it impractical to read or reuse, but it cannot be made truly secret. The repository
> itself stays unreadable without the private key.
