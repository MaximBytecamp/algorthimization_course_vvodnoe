"""Проверка самостоятельных примеров HTML-справочника (только stdlib).
Запуск: python3 mdk0101-razrabotka-modulei/oop/check_examples.py
Исполняет только помеченные data-run="python" примеры доверенного учебника.
"""
import json
from html.parser import HTMLParser
from pathlib import Path
import subprocess
import sys
import tempfile


class Examples(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.figures = []
        self.current = None
        self.pre = False
        self.ids = set()
        self.links = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs:
            if attrs['id'] in self.ids:
                raise ValueError(f"Повторный id: {attrs['id']}")
            self.ids.add(attrs['id'])
        if tag == 'a' and 'href' in attrs:
            self.links.append(attrs['href'])
        if tag in ('img', 'script') and attrs.get('src'):
            self.links.append(attrs['src'])
        if tag == 'link' and attrs.get('href'):
            self.links.append(attrs['href'])
        if tag in ('source', 'img') and attrs.get('srcset'):
            self.links.extend(part.strip().split()[0] for part in attrs['srcset'].split(',') if part.strip())
        if tag == 'figure':
            self.current = {'run': attrs.get('data-run'), 'class': attrs.get('class', '').split(), 'text': ''}
        elif tag == 'pre':
            self.pre = True

    def handle_endtag(self, tag):
        if tag == 'pre':
            self.pre = False
        elif tag == 'figure' and self.current is not None:
            self.figures.append(self.current)
            self.current = None

    def handle_data(self, data):
        if self.pre and self.current is not None:
            self.current['text'] += data


def main():
    root = Path(__file__).resolve().parent
    pages = {}
    count = failures = 0
    for path in sorted(root.rglob('*.html')):
        parsed = Examples()
        parsed.feed(path.read_text())
        pages[path] = parsed
    chapters = json.loads((root / 'chapters.json').read_text(encoding='utf-8'))
    for chapter in chapters:
        path = (root / chapter['path']).resolve()
        if chapter['status'] not in ('ready', 'planned'):
            print(f'FAIL статус {chapter["number"]}: {chapter["status"]}')
            failures += 1
        elif chapter['status'] == 'ready':
            if path not in pages:
                print(f'FAIL отсутствует готовая глава {chapter["number"]}')
                failures += 1
            else:
                parsed = pages[path]
                required = {(root / 'index.html').resolve(), path.parent.parent / 'index.html'}
                linked = {(path.parent / link.split('#')[0]).resolve() for link in parsed.links if '://' not in link}
                if not required <= linked:
                    print(f'FAIL навигация {chapter["number"]}: нет книги или модуля')
                    failures += 1
                if not any(fig['run'] == 'python' for fig in parsed.figures):
                    print(f'FAIL нет примеров {chapter["number"]}')
                    failures += 1
        elif path.exists():
            print(f'FAIL глава {chapter["number"]} существует со статусом planned')
            failures += 1
    with tempfile.TemporaryDirectory(prefix='oop-examples-') as folder:
        for path, parsed in pages.items():
            local = 0
            for i, fig in enumerate(parsed.figures):
                if fig['run'] != 'python':
                    continue
                count += 1
                local += 1
                if i + 1 >= len(parsed.figures) or 'code--out' not in parsed.figures[i + 1]['class']:
                    print(f'FAIL {path.relative_to(root)} #{local}: нет следующего блока вывода')
                    failures += 1
                    continue
                expected = parsed.figures[i + 1]['text'].strip()
                try:
                    result = subprocess.run([sys.executable, '-I', '-c', fig['text'].strip()], cwd=folder, capture_output=True, text=True, timeout=8)
                    ok = result.returncode == 0 and result.stdout.strip() == expected and not result.stderr
                    if not ok:
                        print(f'FAIL {path.relative_to(root)} #{local}\nОжидалось: {expected!r}\nПолучено: {result.stdout!r}\nstderr: {result.stderr}')
                        failures += 1
                except subprocess.TimeoutExpired:
                    print(f'FAIL {path.relative_to(root)} #{local}: timeout')
                    failures += 1
            print(f'{path.relative_to(root)}: {local} примеров')
    for path, parsed in pages.items():
        for link in parsed.links:
            if '://' in link or link.startswith(('mailto:', 'tel:')):
                continue
            target, _, fragment = link.partition('#')
            dest = (path.parent / target).resolve() if target else path
            if not dest.exists():
                print(f'FAIL ссылка {path.relative_to(root)} → {link}')
                failures += 1
            elif fragment and dest in pages and fragment not in pages[dest].ids:
                print(f'FAIL якорь {path.relative_to(root)} → {link}')
                failures += 1
    print(f'Итого: {count} примеров; ошибок: {failures}')
    return bool(failures)


if __name__ == '__main__':
    raise SystemExit(main())
