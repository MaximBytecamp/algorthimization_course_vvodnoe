/* Сверка мок-интервью № 1 ОП.04: примеры студента и результаты его кода сравниваются с эталоном.
   Эталоны написаны на Python, поэтому функция запускает их в Pyodide; логика сверки — api/_lib/mock_check.py.
   Код студента сюда не приходит: его выполняет браузер.
   GET  → { ready }
   POST { action: "tests" | "examples", key, ... } → см. mock_check.py */
const fs = require('fs');
const path = require('path');
const { loadPyodide } = require('pyodide');

let ready = null;
function boot() {
  if (!ready) {
    ready = (async () => {
      const py = await loadPyodide();
      py.runPython(fs.readFileSync(path.join(__dirname, '_lib', 'mock_check.py'), 'utf8'));
      for (const name of ['op04-mok-1.json', 'op04-exam-1.json']) py.globals.get('load_more')(fs.readFileSync(path.join(__dirname, '_data', name), 'utf8'));
      return py.globals.get('process_json');
    })();
    ready.catch(() => { ready = null; });
  }
  return ready;
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'GET') return res.status(200).json({ ready: true });
  if (req.method !== 'POST') return res.status(405).json({ error: 'нужен POST' });
  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = null; } }
  if (!body || typeof body !== 'object') return res.status(400).json({ error: 'запрос не в формате JSON' });
  const text = JSON.stringify(body);
  if (text.length > 200000) return res.status(413).json({ error: 'слишком большой запрос' });
  try {
    const run = await boot();
    const out = JSON.parse(run(text));
    return res.status(out.error ? 400 : 200).json(out);
  } catch (e) {
    console.error('mock-check', e.message);
    return res.status(500).json({ error: 'сверка не удалась, повторите' });
  }
};
