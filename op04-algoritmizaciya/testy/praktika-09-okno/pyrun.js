/* Запуск Python в браузере для задания с кодом: Pyodide 0.27.8 (Python 3.12)
   в фоновом потоке. Загружается по первому запуску, около 10 МБ с cdn.jsdelivr.net.
   Тесты — функции test_* с assert, как в pytest. Бесконечный цикл прерывается
   по лимиту времени, поток после этого создаётся заново. */
const PyRun = (() => {
  const PYODIDE = 'https://cdn.jsdelivr.net/pyodide/v0.27.8/full/';
  const RUNNER = `
import json, io, contextlib, traceback
def _short(e):
    return f"{type(e).__name__}: {e}"
def _run(user, tests):
    ns, out, res = {}, io.StringIO(), []
    try:
        with contextlib.redirect_stdout(out):
            exec(compile(user, "solution.py", "exec"), ns)
    except Exception as e:
        tb = traceback.format_exc(limit=-1).strip().splitlines()
        return json.dumps({"fatal": "\\n".join(l for l in tb[-4:] if not l.startswith("Traceback")), "out": out.getvalue()[-2000:]})
    exec(tests, ns)
    for name, fn in list(ns.items()):
        if not (name.startswith("test_") and callable(fn)):
            continue
        doc = (fn.__doc__ or "").strip()
        try:
            with contextlib.redirect_stdout(out):
                fn()
            res.append([name, True, doc, ""])
        except AssertionError as e:
            res.append([name, False, doc, str(e) or "проверка assert не прошла"])
        except Exception as e:
            res.append([name, False, doc, _short(e)])
    return json.dumps({"results": res, "out": out.getvalue()[-2000:]})
`;
  const workerSrc = `
importScripts('${PYODIDE}pyodide.js');
const ready = loadPyodide({ indexURL: '${PYODIDE}' }).then(py => { py.runPython(${JSON.stringify(RUNNER)}); return py; });
ready.then(() => postMessage({ ready: true }), e => postMessage({ loadError: String(e) }));
onmessage = async e => {
  const py = await ready;
  py.globals.set('USER', e.data.user); py.globals.set('TESTS', e.data.tests);
  try { postMessage({ id: e.data.id, data: JSON.parse(py.runPython('_run(USER, TESTS)')) }); }
  catch (err) { postMessage({ id: e.data.id, data: { fatal: String(err) } }); }
};`;
  let worker = null, readyPromise = null, seq = 0;
  function boot(onStatus) {
    if (readyPromise) return readyPromise;
    onStatus && onStatus('загружается Python — при первом запуске до минуты');
    worker = new Worker(URL.createObjectURL(new Blob([workerSrc], { type: 'text/javascript' })));
    readyPromise = new Promise((ok, fail) => {
      worker.addEventListener('message', function first(e) {
        if (e.data.ready) { worker.removeEventListener('message', first); onStatus && onStatus('Python 3.12 готов'); ok(); }
        if (e.data.loadError) { worker.removeEventListener('message', first); readyPromise = null; onStatus && onStatus('Python не загрузился: нужен интернет'); fail(e.data.loadError); }
      });
    });
    return readyPromise;
  }
  function run(user, tests, limit = 20000, onStatus) {
    return boot(onStatus).then(() => new Promise(resolve => {
      const id = ++seq;
      const timer = setTimeout(() => {
        worker.terminate(); worker = null; readyPromise = null;
        resolve({ fatal: `Код работает дольше ${limit / 1000} секунд и остановлен. Чаще всего это бесконечный цикл: проверьте, что границы окна сдвигаются на каждом шаге.` });
      }, limit);
      const onMsg = e => { if (e.data.id !== id) return; clearTimeout(timer); worker.removeEventListener('message', onMsg); resolve(e.data.data); };
      worker.addEventListener('message', onMsg);
      worker.postMessage({ id, user, tests });
    })).catch(err => ({ fatal: 'Python не загрузился. Нужен интернет: Python скачивается с cdn.jsdelivr.net. ' + err }));
  }
  return { run };
})();
