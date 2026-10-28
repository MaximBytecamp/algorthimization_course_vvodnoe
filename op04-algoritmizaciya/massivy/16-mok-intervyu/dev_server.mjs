/* Локальный запуск секции мок-интервью вместе с серверными функциями, без Vercel CLI.
   Ключ берётся из .env.local в корне репозитория (файл в .gitignore и .vercelignore).
   Запуск из корня репозитория:  node op04-algoritmizaciya/massivy/16-mok-intervyu/dev_server.mjs
   Страница: http://localhost:8016/op04-algoritmizaciya/massivy/16-mok-intervyu/sekciya.html */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
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
const req_ = createRequire(import.meta.url);
const chatHandler = req_(path.join(ROOT, 'api/mock-chat.js'));
const checkHandler = req_(path.join(ROOT, 'api/mock-check.js'));
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.pdf': 'application/pdf' };

const readBody = req => new Promise(ok => { let s = ''; req.on('data', c => { s += c; }); req.on('end', () => ok(s)); });

function vercelRes(res) {
  res.status = code => { res.statusCode = code; return res; };
  res.json = obj => { res.setHeader('Content-Type', 'application/json; charset=utf-8'); res.end(JSON.stringify(obj)); return res; };
  return res;
}

createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const api = { '/api/mock-chat': chatHandler, '/api/mock-check': checkHandler }[url.pathname];
  if (api) {
    const raw = req.method === 'POST' ? await readBody(req) : '';
    try { req.body = raw ? JSON.parse(raw) : {}; } catch { req.body = {}; }
    return api(req, vercelRes(res));
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
