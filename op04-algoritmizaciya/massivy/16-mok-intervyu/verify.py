"""Проверка сверки секции с ИИ-интервьюером (sekciya.html) без браузера и без модели.

1. Эталон каждой задачи, запущенный тем же кодом, что браузер (RUNNER из sekciya.js),
   проходит все тесты сервера (api/mock-check.py).
2. Заготовка с pass проходит не все тесты: тесты что-то проверяют.
3. Примеры карточки с ответами эталона на сервере «сходятся», а с чужим ответом — нет.
4. В pool.js (он открыт на сайте) нет эталонов и ответов.
Запуск: python verify.py
"""
import importlib.util
import json
import pathlib
import re

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parents[2]
spec = importlib.util.spec_from_file_location('mock_check', ROOT / 'api' / 'mock-check.py')
check = importlib.util.module_from_spec(spec)
spec.loader.exec_module(check)

js = (HERE / 'sekciya.js').read_text(encoding='utf-8')
runner = re.search(r'/\*RUNNER\*/const RUNNER = `(.*?)`;/\*/RUNNER\*/', js, re.S).group(1).replace('\\\\', '\\')
ns = {}
exec(runner, ns)
pool = json.loads(re.search(r'window\.MOCK_POOL = (.*);\s*$', (HERE / 'pool.js').read_text(encoding='utf-8'), re.S).group(1))

errors = []
for key, card in check.CARDS.items():
    p = next(x for x in pool if x['key'] == key)
    assert p['cases'] == card['cases'], key
    for label, code, want_all in (('эталон', card['reference_code'], True), ('заготовка', p['signature'], False)):
        run = json.loads(ns['_run'](code, card['fn'], json.dumps(card['cases'])))
        if 'fatal' in run:
            errors.append(f'{key} {label}: {run["fatal"]}')
            continue
        res = check.process({'action': 'tests', 'key': key, 'outputs': [{'ret': o['ret'], 'args': o['args']} for o in run['results']]})
        if want_all and res['passed'] != res['total']:
            errors.append(f'{key}: эталон прошёл {res["passed"]} из {res["total"]}')
        if not want_all and res['passed'] == res['total']:
            errors.append(f'{key}: заготовка с pass прошла все тесты')
    rows = [{'args': re.match(rf'{card["fn"]}\((.*)\)$', e['call'], re.S).group(1), 'answer': e['answer']} for e in card['examples']]
    v = check.process({'action': 'examples', 'key': key, 'rows': rows})['verdicts']
    if any(x != 'ok' for x in v):
        errors.append(f'{key}: примеры карточки {v}')
    if check.process({'action': 'examples', 'key': key, 'rows': [{'args': rows[0]['args'], 'answer': '"не тот ответ"'}]})['verdicts'] != ['bad']:
        errors.append(f'{key}: неверный ответ примера засчитан')

public = (HERE / 'pool.js').read_text(encoding='utf-8')
for card in check.CARDS.values():
    body = card['reference_code'].split('\n', 1)[1].strip().splitlines()
    if any(line.strip() and len(line.strip()) > 12 and line.strip() in public for line in body):
        errors.append(f'{card["key"]}: строка эталона есть в pool.js')
if (HERE / 'cards.json').exists():
    errors.append('cards.json снова лежит в открытой папке')

print('\n'.join(errors) or f'всё сходится: задач {len(check.CARDS)}, тестов {sum(len(c["cases"]) for c in check.CARDS.values())}')
raise SystemExit(1 if errors else 0)
