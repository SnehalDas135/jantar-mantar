// Jantar Mantar — local static server for playing on your own Wi-Fi (`npm start`).
// Phones talk to the game screen peer-to-peer (WebRTC), so this only serves files and tells the
// game screen the laptop's Wi-Fi address for the QR codes. Online, Vercel serves `public/` instead.

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { exec } = require('child_process');

const PORT = Number(process.env.PORT) || 3000;
const PUBLIC = path.join(__dirname, 'public');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.json': 'application/json',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.mp4': 'audio/mp4',
  '.m4a': 'audio/mp4',
  '.mp3': 'audio/mpeg',
  '.webmanifest': 'application/manifest+json',
};

// Pick the address phones on the same Wi-Fi can reach.
function lanIP() {
  if (process.env.HOST_IP) return process.env.HOST_IP;
  const candidates = [];
  for (const [name, addrs] of Object.entries(os.networkInterfaces())) {
    for (const a of addrs || []) {
      if (a.family !== 'IPv4' || a.internal) continue;
      let score = 0;
      if (/^(en|wl|eth)/.test(name)) score += 2;
      if (/^192\.168\./.test(a.address)) score += 3;
      else if (/^10\./.test(a.address)) score += 2;
      else if (/^172\.(1[6-9]|2\d|3[01])\./.test(a.address)) score += 1;
      candidates.push({ address: a.address, score });
    }
  }
  candidates.sort((a, b) => b.score - a.score);
  return candidates[0]?.address || 'localhost';
}

const IP = lanIP();

function sendFile(res, file, req) {
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    const type = MIME[path.extname(file)] || 'application/octet-stream';
    // Range requests let audio players seek (e.g. start a clip at 1s).
    const range = req && /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || '');
    if (range) {
      const start = range[1] ? Number(range[1]) : 0;
      const end = range[2] ? Math.min(Number(range[2]), data.length - 1) : data.length - 1;
      res.writeHead(206, {
        'Content-Type': type, 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-cache',
        'Content-Range': `bytes ${start}-${end}/${data.length}`, 'Content-Length': end - start + 1,
      });
      res.end(data.subarray(start, end + 1));
      return;
    }
    res.writeHead(200, { 'Content-Type': type, 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-cache' });
    res.end(data);
  });
}

function safeJoin(root, urlPath) {
  const p = path.normalize(path.join(root, decodeURIComponent(urlPath)));
  return p.startsWith(root) ? p : null;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  const p = url.pathname;

  if (p === '/api/info') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ip: IP, port: PORT }));
    return;
  }
  if (p === '/controller') { res.writeHead(302, { Location: '/controller/' + url.search }); res.end(); return; }

  let file = safeJoin(PUBLIC, p);
  if (!file) { res.writeHead(403); res.end(); return; }
  if (p.endsWith('/')) file = path.join(file, 'index.html');
  sendFile(res, file, req);
});

server.listen(PORT, () => {
  console.log('\n  🕹  JANTAR MANTAR is running\n');
  console.log(`  Game screen (this laptop):  http://localhost:${PORT}`);
  if (IP === 'localhost') console.log('\n  ⚠  No Wi-Fi address found — phones will not be able to connect.');
  console.log(`  Phones on the same Wi-Fi:   http://${IP}:${PORT}`);
  console.log('\n  Scan the QR codes on the game screen (needs internet for the WebRTC handshake).\n');
  if (process.platform === 'darwin' && !process.env.NO_OPEN) exec(`open http://localhost:${PORT}`);
});
