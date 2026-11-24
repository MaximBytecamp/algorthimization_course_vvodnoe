"""Rebuild module 25 code traces from the examples in its HTML chapters.

Run: python3 docs/project-context/tools/build_queue25_traces.py
The snapshots are captured by CPython before each executed source line.
"""
from __future__ import annotations

import dis
import json
import sys
from collections import deque
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
BASE = ROOT / 'op04-algoritmizaciya/lineynye/25-ochered-i-dek'


class CodeBlocks(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.depth = 0
        self.blocks = []
        self.current = []

    def handle_starttag(self, tag, attrs):
        if tag == 'pre':
            self.depth += 1
            self.current = []

    def handle_endtag(self, tag):
        if tag == 'pre':
            self.depth -= 1
            self.blocks.append(''.join(self.current))

    def handle_data(self, data):
        if self.depth:
            self.current.append(data)


def source(filename, marker):
    parser = CodeBlocks()
    parser.feed((BASE / filename).read_text())
    return next(block for block in parser.blocks if marker in block and '>>>' not in block).strip()


def snapshot(frame):
    values = {}
    for name, value in frame.f_locals.items():
        if name == 'self' or (name == 'q' and hasattr(value, 'data')):
            for field in ['data', 'head', 'size']:
                if hasattr(value, field):
                    values[name + '.' + field] = repr(getattr(value, field))
        elif isinstance(value, (str, int, bool, list, tuple, deque, type(None))):
            values[name] = repr(value)
    return values


def explanation(line, event, value, is_yield):
    text = line.strip()
    if event == 'return':
        if is_yield:
            return f'Выдано значение {value!r}. Перебор приостановлен до следующего запроса.'
        return f'Вызов завершён, возвращается {value!r}.'
    if text.startswith('def ') or text.startswith('class '):
        return 'Создаётся функция или класс. Тело вызова выполняется при обращении к нему.'
    if text.startswith('raise '):
        return 'Нарушен контракт: выполнение завершится указанным исключением.'
    if text.startswith('return '):
        return 'Сейчас вычисляется и возвращается результат вызова.'
    if text.startswith('yield '):
        return 'Сейчас выдаётся максимум полного окна. Следующий запрос продолжит этот же перебор.'
    if 'popleft()' in text and 'completed' in text:
        return 'Первая ожидающая задача снимается из начала и записывается в выполненные.'
    if 'popleft()' in text:
        return 'Устаревший кандидат снимается из начала дека.'
    if 'candidates.pop()' in text:
        return 'Последний кандидат вытеснен новым значением и снимается с конца дека.'
    if 'candidates.append' in text:
        return 'Текущий индекс или пара добавляется в конец дека кандидатов.'
    if 'answer.append' in text:
        return 'Значение первого кандидата записывается как максимум текущего полного окна.'
    if 'pending.append' in text:
        return 'Новая задача добавляется после уже ожидающих.'
    if 'closed = True' in text:
        return 'Приём закрывается до выполнения оставшихся задач.'
    if text.startswith(('if ', 'elif ', 'while ')):
        return 'Проверяется условие. Следующий подсвеченный номер покажет выбранную ветвь.'
    if text.startswith('for '):
        return 'Цикл получает следующий элемент. При завершении входа управление выйдет из цикла.'
    if 'tail =' in text:
        return 'Вычисляется позиция записи по кругу: (head + size) % capacity.'
    if 'self.head =' in text and '%' in text:
        return 'Индекс головы переходит к следующей ячейке по кругу.'
    if 'self.data[self.head] = None' in text:
        return 'Ссылка в снятой ячейке очищается; сохранённое value остаётся доступным.'
    if 'self.data[tail] =' in text:
        return 'Значение записывается в вычисленную свободную ячейку.'
    if 'self.size +=' in text or 'self.size -=' in text:
        return 'Обновляется число элементов. Физическая длина массива сохраняется.'
    return 'Сейчас выполняется подсвеченная строка. Изменение состояния появится на следующем шаге.'


def record(code, call, arr, arr_name, ptrs, describe=explanation):
    filename = '<queue25-trace>'
    namespace = {}
    exec(compile(code, filename, 'exec'), namespace)
    lines = code.splitlines()
    frames = []
    instructions = {}

    def trace(frame, event, value):
        if frame.f_code.co_filename != filename:
            return None
        if event not in ('line', 'return'):
            return trace
        if frame.f_code not in instructions:
            instructions[frame.f_code] = {item.offset: item.opname for item in dis.get_instructions(frame.f_code)}
        is_yield = event == 'return' and instructions[frame.f_code].get(frame.f_lasti) == 'YIELD_VALUE'
        state = snapshot(frame)
        state['вызов'] = frame.f_code.co_name
        frames.append({
            'ln': frame.f_lineno,
            'ev': 'return' if event == 'return' and not is_yield else 'line',
            'vars': state,
            'arr': arr,
            'ret': repr(value) if event == 'return' else None,
            'err': None,
            'say': describe(lines[frame.f_lineno - 1], event, value, is_yield),
        })
        return trace

    old = sys.gettrace()
    try:
        sys.settrace(trace)
        result = eval(call, namespace)
    finally:
        sys.settrace(old)
    assert frames and frames[-1]['ev'] == 'return'
    assert all(1 <= frame['ln'] <= len(lines) for frame in frames)
    return {'code': lines, 'frames': frames, 'call': call, 'arr_name': arr_name,
            'ptrs': ptrs, 'result': repr(result), 'after': repr(arr), 'error': None}


def build():
    tasks = source('01-ochered-zadach.html', 'def process_tasks')
    ring = source('02-kolcevoy-bufer.html', 'class RingQueue')
    window = source('03-maksimum-okna.html', 'def max_window')
    stream = source('05-praktika-i-dz.html', 'def iter_max_window')
    ring += '\n\ndef ring_demo():\n    q = RingQueue(3)\n    q.push("A")\n    q.push("B")\n    q.push("C")\n    first = q.pop()\n    q.push("D")\n    return [q.pop(), q.pop(), q.pop()]'
    stream += '\n\ndef stream_demo():\n    return list(iter_max_window(iter([4, 1, 3, 5, 2, 5]), 3))'
    commands = [('add', 'A'), ('add', 'B'), ('run',), ('add', 'C'), ('close',)]
    traces = {
        'queue25_tasks': record(tasks, f'process_tasks({commands!r})', commands, 'команды', []),
        'queue25_ring': record(ring, 'ring_demo()', ['A', 'B', 'C', 'D'], 'входные задачи', []),
        'queue25_window': record(window, 'max_window([4, 1, 3, 5, 2, 5], 3)', [4, 1, 3, 5, 2, 5], 'nums', ['i']),
        'queue25_stream': record(stream, 'stream_demo()', [4, 1, 3, 5, 2, 5], 'значения потока', ['i']),
    }
    expected = ["(['A', 'B', 'C'], [])", "['B', 'C', 'D']", '[4, 5, 5, 5]', '[4, 5, 5, 5]']
    assert [t['result'] for t in traces.values()] == expected
    payload = json.dumps(traces, ensure_ascii=False, indent=2)
    (BASE / 'traces25.js').write_text('/* Снимки CPython перед строкой; генератор: docs/project-context/tools/build_queue25_traces.py. */\nwindow.TRACES = Object.assign(window.TRACES || {}, ' + payload + ');\n')
    print('Built:', ', '.join(f'{key}: {len(t["frames"])} frames' for key, t in traces.items()))
    return traces


if __name__ == '__main__':
    build()
