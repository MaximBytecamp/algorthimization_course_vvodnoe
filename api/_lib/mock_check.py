"""Сверка для мок-интервью № 1 ОП.04 (страница op04-algoritmizaciya/massivy/16-mok-intervyu/sekciya.html).

Модуль запускает только эталонные решения из api/_data/op04-mok-1.json. Код студента сюда
не приходит: его выполняет браузер, а сюда отправляет результаты. Поэтому ответы тестов
и эталон на страницу не попадают. На сервере модуль выполняет Pyodide внутри api/mock-check.js.

Два действия:
  {"action": "tests", "key": "08-pair", "outputs": [{"ret": ..., "args": ...}, ...]}
      — результаты кода студента на входах cards[key].cases → [true/false, ...];
  {"action": "examples", "key": "08-pair", "rows": [{"args": "[1, 2], 3", "answer": "(0, 1)"}]}
      — примеры, которые студент посчитал сам → "ok" / "bad" / "parse" по каждой строке.

Локально: echo '{...}' | python api/_lib/mock_check.py
"""
import ast
import copy
import json
import os
import sys

CARDS = {}
_FUNCS = {}


def load(cards_json):
    CARDS.clear()
    _FUNCS.clear()
    load_more(cards_json)


def load_more(cards_json):
    CARDS.update({c['key']: c for c in json.loads(cards_json)})


# Пул мок-интервью и экзамен. Под Pyodide файла модуля нет: карточки передаёт api/mock-check.js через load_more().
_DIR = os.path.join(os.path.dirname(os.path.abspath(globals().get('__file__', '.'))), '..', '_data')
if '__file__' in globals():
    for _name in ('op04-mok-1.json', 'op04-exam-1.json'):
        if os.path.exists(os.path.join(_DIR, _name)):
            with open(os.path.join(_DIR, _name), encoding='utf-8') as fh:
                load_more(fh.read())


def norm(x):
    """То же приведение, что в браузере (RUNNER в sekciya.js): кортеж = список, 2.0 = 2."""
    if isinstance(x, bool) or x is None or isinstance(x, (int, str)):
        return x
    if isinstance(x, float):
        return int(x) if x.is_integer() else round(x, 6)
    if isinstance(x, (list, tuple)):
        return [norm(v) for v in x]
    if isinstance(x, (set, frozenset)):
        return sorted((norm(v) for v in x), key=repr)
    if isinstance(x, dict):
        return {str(k): norm(v) for k, v in x.items()}
    return {'repr': repr(x)[:200]}


def reference(card):
    if card['key'] not in _FUNCS:
        ns = {}
        exec(card['reference_code'], ns)
        # У задач экзамена своё имя функции для студента, эталон зовётся по исходному (ref_fn).
        _FUNCS[card['key']] = ns[card.get('ref_fn', card['fn'])]
    return _FUNCS[card['key']]


def observe(card, args):
    args = copy.deepcopy(list(args))
    try:
        ret = norm(reference(card)(*args))
    except Exception as e:
        ret = {'raise': type(e).__name__}
    return {'ret': ret, 'args': norm(args)}


def view(card, o):
    if not card.get('view') or not isinstance(o, dict):
        return o
    try:
        return eval(card['view'], {'sorted': sorted, 'isinstance': isinstance, 'int': int, 'bool': bool},
                    {'ret': o.get('ret'), 'args': o.get('args')})
    except Exception:
        return ['ошибка формата', o]


def same(a, b):
    return json.dumps(a, sort_keys=True, ensure_ascii=False) == json.dumps(b, sort_keys=True, ensure_ascii=False)


def check_tests(card, outputs):
    if not isinstance(outputs, list) or len(outputs) != len(card['cases']):
        return {'error': 'число результатов не совпадает с числом тестов'}
    results = []
    for src, got in zip(card['cases'], outputs):
        want = observe(card, ast.literal_eval(src))
        got = {'ret': got.get('ret'), 'args': got.get('args')} if isinstance(got, dict) else got
        results.append(same(view(card, want), view(card, got)))
    return {'results': results, 'passed': sum(results), 'total': len(results)}


def parse_literal(text, as_args):
    text = str(text).strip()
    if not text or len(text) > 400:
        raise ValueError
    value = ast.literal_eval(f'({text},)' if as_args else text)
    return value


def check_examples(card, rows):
    if not isinstance(rows, list) or len(rows) > 12:
        return {'error': 'примеров должно быть от 1 до 12'}
    verdicts = []
    for row in rows:
        try:
            args = parse_literal(row.get('args', ''), True)
            answer_text = str(row.get('answer', '')).strip()
            want = observe(card, args)
            if isinstance(want['ret'], dict) and 'raise' in want['ret']:
                verdicts.append('ok' if want['ret']['raise'] in answer_text else 'bad')
                continue
            answer = norm(parse_literal(answer_text, False))
        except Exception:
            verdicts.append('parse')
            continue
        # Для функций, которые меняют список на месте, ответом считается и сам список после вызова.
        first = want['args'][0] if want['args'] else None
        variants = [want['ret'], first, [want['ret'], first]]
        if card.get('view'):
            variants = [want['ret']]
        verdicts.append('ok' if any(same(answer, v) for v in variants) else 'bad')
    return {'verdicts': verdicts}


def process_json(text):
    return json.dumps(process(json.loads(text)), ensure_ascii=False)


def process(payload):
    card = CARDS.get(str(payload.get('key', '')))
    if not card:
        return {'error': 'нет такой задачи'}
    if payload.get('action') == 'tests':
        return check_tests(card, payload.get('outputs'))
    if payload.get('action') == 'examples':
        return check_examples(card, payload.get('rows'))
    return {'error': 'неизвестное действие'}


if __name__ == '__main__' and '__file__' in globals():
    print(json.dumps(process(json.load(sys.stdin)), ensure_ascii=False))
