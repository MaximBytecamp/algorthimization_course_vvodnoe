// Загрузка данных ТЗ: требования из ../content.py (общий источник с сайтом) и легенда из data/tz-0N-*.mjs.
import { readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = join(dirname(fileURLToPath(import.meta.url)), '..');

export async function load(only = []) {
  const content = JSON.parse(execFileSync('python3', ['-B', '-c', 'import json, content; print(json.dumps(content.TZ, ensure_ascii=False))'], { cwd: join(here, '..') }).toString());
  const files = readdirSync(join(here, 'data')).filter(f => /^tz-\d\d-.*\.mjs$/.test(f)).sort()
    .filter(f => !only.length || only.some(n => f.startsWith(`tz-${n.padStart(2, '0')}`)));
  const out = [];
  for (const f of files) {
    const tz = (await import(pathToFileURL(join(here, 'data', f)))).default;
    const req = content.find(t => t.slug === tz.slug);
    if (!req) throw new Error(`${f}: в content.py нет ТЗ ${tz.slug}`);
    for (const r of tz.acceptance.flatMap(([, items]) => items.flatMap(i => i[2].split(', ')))) {
      const [, g, j] = r.split('.').map(Number);
      if (!req.groups[g - 1] || !req.groups[g - 1][1][j - 1]) throw new Error(`${f}: нет требования ${r}`);
    }
    out.push({ tz, req });
  }
  return out;
}
