"""Собирает пул задач мок-интервью № 1 из тренажёров модулей 8–12.

Источник — списки TASKS в make_mock.py каждого модуля: те же условия, уточнения,
примеры, перебор, правило шага, сложность и вопрос-продолжение, что в главах 8.6–12.6.
Результат:
  pool.js — window.MOCK_POOL: условие, уровень, ссылки для билета, заголовок функции
            и входы тестов секции (без ответов);
  api/_data/op04-mok-1.json — карточки задач для ИИ-интервьюера и эталоны для сверки.
            Файл лежит у серверных функций: на сайт как страница он не попадает.
Ответы примеров считаются запуском эталона, как в make_mock.py модулей.
Входы тестов секции — примеры карточки и все вызовы из тестов тренажёра.
Запуск: python make_pool.py
"""
import ast
import contextlib
import copy
import html
import importlib.util
import io
import json
import os
import pathlib
import re
import textwrap

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parents[2]
SERVER_DATA = ROOT / 'api' / '_data' / 'op04-mok-1.json'
MODULES = ['08-dva-ukazatelya', '09-okno', '10-okno-peremennoe', '11-prefiksnye-summy', '12-intervaly']

# Задачи, где верных ответов несколько: сверяется не сам результат, а его признаки.
# Выражение получает ret и args (как их вернул запуск) и строит то, что сравнивается.
VIEWS = {
    '08-split': '[ret, sorted(args[0][:ret]), sorted(args[0][ret:])] if isinstance(ret, int) and not isinstance(ret, bool) else [ret, args]',
}


def test_calls(t, ref):
    """Входы всех вызовов функции в тестах тренажёра: тесты запускаются на эталоне."""
    seen = []

    def spy(*args):
        seen.append(copy.deepcopy(args))
        return ref(*args)
    ns = {t['fn']: spy}
    exec(t['tests'], ns)
    for name, fn in list(ns.items()):
        if name.startswith('test_') and callable(fn):
            fn()
    return seen


def signature(src, fn):
    head = next(line for line in textwrap.dedent(src).splitlines() if line.startswith(f'def {fn}('))
    return head + '\n    pass\n'

# Уровень по LeetCode (проверен через API 27.10.2026); задачи без номера LeetCode отнесены вручную.
EASY = {
    '08': {'dedup', 'zeros', 'subseq', 'budget'},
    '09': {'sums', 'best', 'avg', 'scores'},
    '11': {'range', 'pivot', 'diff'},
    '12': {'attend', 'summary', 'cars'},
}
# Решается одним условием без прохода: для 25 минут секции мало.
SKIP = {('12', 'conflict2')}


def text(s):
    """HTML-фрагмент из описания задачи → обычный текст."""
    return html.unescape(re.sub(r'<[^>]+>', '', str(s)))


def load(module_dir):
    os.chdir(HERE.parent / module_dir)
    spec = importlib.util.spec_from_file_location('mock_' + module_dir[:2], 'make_mock.py')
    m = importlib.util.module_from_spec(spec)
    with contextlib.redirect_stdout(io.StringIO()):
        spec.loader.exec_module(m)
    return m


def main():
    pool, cards = [], []
    for d in MODULES:
        m = load(d)
        num = d[:2]
        for t in m.TASKS:
            if (num, t['id']) in SKIP:
                continue
            level = 'easy' if t['id'] in EASY.get(num, set()) else 'medium'
            f = m.load(m.REF[t['fn']], t['fn'])
            examples = []
            for args, what in t['examples']:
                a = copy.deepcopy(list(args))
                try:
                    want = repr(f(*a))
                except Exception as e:
                    want = f'{type(e).__name__}'
                examples.append({'call': f"{t['fn']}({', '.join(repr(x) for x in args)})", 'answer': want, 'checks': text(what)})
            key = f'{num}-{t["id"]}'
            chapter = t['chapter'] if t['chapter'][0].isdigit() else None
            cases = []
            for args in [a for a, _ in t['examples']] + test_calls(t, f):
                src = repr(tuple(args))
                if src not in cases:
                    ast.literal_eval(src)
                    cases.append(src)
            pool.append({
                'key': key, 'module': int(num), 'level': level, 'title': t['title'], 'source': t['lc'],
                'url': t.get('lc_url', ''), 'say': t['say'], 'chapter': chapter,
                'trainer': f'../{d}/06-mok-intervyu.html#task-{t["id"]}',
                'fn': t['fn'], 'signature': signature(m.REF[t['fn']], t['fn']), 'cases': cases,
            })
            good, bad, why = t['cx']
            cards.append({
                'key': key, 'level': level, 'module': int(num), 'title': t['title'], 'source': t['lc'],
                'statement': text(t['say']),
                'retell': text(t['retell']),
                'clarifications': [{'question': text(q), 'answer': text(a), 'fact': text(fa), 'effect': text(c)} for q, a, fa, c in t['ask']],
                'examples': examples,
                'brute_force': text(t['brute']),
                'technique': text(m.FORMS[t['form']]),
                'technique_why': text(t['form_hint']),
                'hints': {
                    'idea': text(t['form_hint']),
                    'technique': text(m.FORMS[t['form']]),
                    'steps': [f"{text(a)}: {text(b)}" for a, b in t['steps']],
                },
                'complexity': {'answer': text(good), 'wrong_options': [text(b) for b in bad], 'why': text(why)},
                'chapter': chapter,
                'fn': t['fn'],
                'cases': cases,
                'view': VIEWS.get(key),
                'reference_code': textwrap.dedent(m.REF[t['fn']]).strip(),
                'follow_up': {'question': text(t['follow'][0]),
                              'answer': next(text(w) for o, ok, w in t['follow'][1] if ok)},
            })
    os.chdir(HERE)
    with open('pool.js', 'w', encoding='utf-8') as fh:
        fh.write('/* Пул задач мок-интервью № 1. Файл собран скриптом make_pool.py: править вручную не нужно. */\n')
        fh.write('window.MOCK_POOL = ' + json.dumps(pool, ensure_ascii=False) + ';\n')
    SERVER_DATA.parent.mkdir(parents=True, exist_ok=True)
    with open(SERVER_DATA, 'w', encoding='utf-8') as fh:
        json.dump(cards, fh, ensure_ascii=False, indent=1)
    easy = sum(p['level'] == 'easy' for p in pool)
    print(f'задач {len(pool)}: простых {easy}, чуть сложнее {len(pool) - easy}')


if __name__ == '__main__':
    main()
