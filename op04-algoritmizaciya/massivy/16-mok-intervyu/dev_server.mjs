/* Локальный запуск секции мок-интервью вместе с серверными функциями, без Vercel CLI.
   Ключ берётся из .env.local в корне репозитория (файл в .gitignore и .vercelignore).
   Запуск из корня репозитория:  node op04-algoritmizaciya/massivy/16-mok-intervyu/dev_server.mjs
   Страница: http://localhost:8016/op04-algoritmizaciya/massivy/16-mok-intervyu/sekciya.html */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const PORT = Number(process.env.PORT) || 8016;
const envFile = path.join(ROOT, '.env.local');
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}
const chatHandler = createRequire(import.meta.url)(path.join(ROOT, 'api/mock-chat.js'));
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.pdf': 'application/pdf' };

const readBody = req => new Promise(ok => { let s = ''; req.on('data', c => { s += c; }); req.on('end', () => ok(s)); });

function vercelRes(res) {
  res.status = code => { res.statusCode = code; return res; };
  res.json = obj => { res.setHeader('Content-Type', 'application/json; charset=utf-8'); res.end(JSON.stringify(obj)); return res; };
  return res;
}

function runCheck(body) {
  return new Promise(ok => {
    const p = spawn('python3', [path.join(ROOT, 'api/mock-check.py')]);
    let out = '';
    p.stdout.on('data', c => { out += c; });
    p.stderr.on('data', c => process.stderr.write(c));
    p.on('close', () => ok(out));
    p.stdin.end(body || '{}');
  });
}

createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/api/mock-chat') {
    const raw = req.method === 'POST' ? await readBody(req) : '';
    try { req.body = raw ? JSON.parse(raw) : {}; } catch { req.body = {}; }
    return chatHandler(req, vercelRes(res));
  }
  if (url.pathname === '/api/mock-check') {
    if (req.method !== 'POST') return vercelRes(res).status(200).json({ ready: true });
    const out = await runCheck(await readBody(req));
    const data = JSON.parse(out || '{"error":"сверка упала"}');
    return vercelRes(res).status(data.error ? 400 : 200).json(data);
  }
  let file = path.join(ROOT, decodeURIComponent(url.pathname));
  if (!file.startsWith(ROOT) || file.includes(`${path.sep}api${path.sep}`)) { res.statusCode = 404; return res.end(); }
  if (file.endsWith('/')) file += 'index.html';
  try {
    const data = await readFile(file);
    res.setHeader('Content-Type', TYPES[path.extname(file)] || 'application/octet-stream');
    res.end(data);
  } catch { res.statusCode = 404; res.end('not found'); }
}).listen(PORT, () => console.log(`http://localhost:${PORT}/op04-algoritmizaciya/massivy/16-mok-intervyu/sekciya.html`));
