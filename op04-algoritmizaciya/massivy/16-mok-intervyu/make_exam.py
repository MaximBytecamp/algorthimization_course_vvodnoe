"""Собирает экзамен (ekzamen.html) из пула мок-интервью и новых условий exam_tasks.py.

У задачи экзамена эталон, входы тестов, техника и сложность — из карточки пула
(api/_data/op04-mok-1.json, её собирает make_pool.py), сюжет и уточнения — из exam_tasks.py.
Результат:
  exam-pool.js — window.EXAM_POOL: условие, уровень, заголовок функции, входы тестов (без ответов);
  api/_data/op04-exam-1.json — карточки экзамена для интервьюера и сверки (на сайт как файл не попадает).
Запуск: python make_exam.py  (после make_pool.py)
"""
import copy
import json
import pathlib

from exam_tasks import EXAM

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parents[2]
cards = {c['key']: c for c in json.loads((ROOT / 'api/_data/op04-mok-1.json').read_text(encoding='utf-8'))}
assert set(EXAM) == set(cards), set(cards) ^ set(EXAM)

pool, out = [], []
for key, (fn, params, title, say, retell, ask, (fq, fa)) in EXAM.items():
    c = copy.deepcopy(cards[key])
    ref_fn = c['fn']
    ek = 'E-' + key
    c.update({
        'key': ek, 'fn': fn, 'ref_fn': ref_fn, 'title': title, 'source': 'экзамен',
        'statement': say, 'retell': retell,
        'clarifications': [{'question': q, 'answer': a, 'fact': f, 'effect': ''} for q, a, f in ask],
        'follow_up': {'question': fq, 'answer': fa},
    })
    for e in c['examples']:
        assert e['call'].startswith(ref_fn + '(')
        e['call'] = fn + e['call'][len(ref_fn):]
    out.append(c)
    pool.append({'key': ek, 'module': c['module'], 'level': c['level'], 'title': title, 'say': say,
                 'fn': fn, 'signature': f'def {fn}({params}):\n    pass\n', 'cases': c['cases']})

(ROOT / 'api/_data/op04-exam-1.json').write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding='utf-8')
with open(HERE / 'exam-pool.js', 'w', encoding='utf-8') as fh:
    fh.write('/* Пул задач экзамена. Файл собран скриптом make_exam.py: править вручную не нужно. */\n')
    fh.write('window.EXAM_POOL = ' + json.dumps(pool, ensure_ascii=False) + ';\n')
easy = sum(p['level'] == 'easy' for p in pool)
print(f'экзамен: задач {len(pool)}, простых {easy}, чуть сложнее {len(pool) - easy}')
