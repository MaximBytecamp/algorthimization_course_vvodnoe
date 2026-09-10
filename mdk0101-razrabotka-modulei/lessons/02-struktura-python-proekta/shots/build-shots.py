import re, html, json, pathlib
LOG = pathlib.Path('/tmp/python-book-evidence/log.txt').read_text()
blocks = {}
for m in re.finditer(r'##### (\S+)\n\$prompt ([^\n]*)\n\$cmd ([^\n]*)\n(.*?)##### end\n', LOG, re.S):
    bid, prompt, cmd, out = m.groups()
    out = out.replace('/private/tmp/', '/tmp/')
    blocks[bid] = {'prompt': prompt.strip(), 'cmd': cmd.strip(), 'out': out.rstrip('\n')}

def ansi(text):
    """Convert a small subset of ANSI SGR to spans; escape everything else."""
    out, pos, open_span = '', 0, False
    for m in re.finditer(r'\x1b\[([0-9;]*)m', text):
        out += html.escape(text[pos:m.start()]); pos = m.end()
        codes = m.group(1)
        if open_span: out += '</span>'; open_span = False
        if codes and codes != '0':
            cls = 'g' if '32' in codes.split(';') else 'b'
            out += f'<span class="{cls}">'; open_span = True
    out += html.escape(text[pos:])
    if open_span: out += '</span>'
    return out

def term(*items):
    """items: (block_id, shown_command) pairs, or ('--', 'label') separators."""
    parts = []
    for bid, shown in items:
        if bid == '--':
            parts.append(f'<div class="sep">{html.escape(shown)}</div>'); continue
        b = blocks[bid]
        parts.append(f'<div class="prompt">{html.escape(b["prompt"])} {html.escape(shown)}</div>')
        body = ansi(b['out']) if b['out'].strip() else '<i>(команда завершилась без вывода)</i>'
        parts.append(f'<pre>{body}</pre>')
    return ''.join(parts)

SHOTS = [
 ('01-environment', 'Окружение проекта создано и активно', 'macOS · Python 3.12 · реальный вывод',
  term(('p1-version','python3 --version'), ('p1-create','python3 -m venv .venv'),
       ('p1-after','which python'))),
 ('05-venv-inside', 'Что лежит внутри .venv', 'macOS · Python 3.12 · реальный вывод',
  term(('p1-inside','ls .venv   +   cat .venv/pyvenv.cfg'), ('p1-list','python -m pip list'))),
 ('06-import-error', 'До установки библиотеки нет', 'macOS · Python 3.12 · реальный вывод',
  term(('p3-missing','python -c "import rich"'))),
 ('07-pip-install', 'Установка пакета: что печатает pip', 'macOS · Python 3.12 · реальный вывод',
  term(('p3-install','python -m pip install rich==13.9.4'))),
 ('02-rich', 'Проверяем установленный пакет', 'macOS · Python 3.12 · реальный вывод',
  term(('p3-show','python -m pip show rich'), ('p3-which-pip','python -m pip --version'))),
 ('09-rich-color', 'Тот же расчёт, вывод через Rich', 'macOS · Python 3.12 · реальный вывод',
  term(('p3-run','python main.py'))),
 ('08-isolation', 'Изоляция: один и тот же пакет, разные места', 'показаны только строки Name / Version / Location',
  term(('--','ВНУТРИ ОКРУЖЕНИЯ ПРОЕКТА'), ('p3-show','python -m pip show rich'),
       ('--','ПОСЛЕ deactivate — БАЗОВЫЙ PYTHON'), ('p3-off','which python3   +   python3 -m pip show rich'))),
 ('10-run-wrong', 'Два способа запуска: один работает', 'macOS · Python 3.12 · реальный вывод',
  term(('p5-wrong','python app/main.py'), ('p5-run','python -m app.main'))),
 ('03-run', 'Запускаем пакет из корня проекта', 'macOS · Python 3.12 · реальный вывод',
  term(('p5-run','python -m app.main'), ('p5-import','python -c "import app.main"'))),
 ('04-tests', 'Тесты подтверждают, что перенос ничего не сломал', 'macOS · Python 3.12 · реальный вывод',
  term(('p6-tests','python -m unittest discover -s tests -v'))),
 ('11-freeze', 'Фиксируем список библиотек', 'macOS · Python 3.12 · реальный вывод',
  term(('p6-freeze','python -m pip freeze'), ('p6-freeze-file','python -m pip freeze > requirements.txt   +   cat requirements.txt'))),
 ('12-clean-start', 'Проверка с чистого листа: только исходники', 'macOS · Python 3.12 · реальный вывод',
  term(('p6-clean-tree','ls -a   (папка без .venv)'), ('p6-clean-install','python -m pip install -r requirements.txt'),
       ('p6-clean-run','python -m app.main   +   python -m unittest discover -s tests -v'))),
]

# shorten the very long pip show inside the isolation shot
SHOTS = [list(s) for s in SHOTS]
for s in SHOTS:
    if s[0] == '08-isolation':
        def trim(html_text):
            return html_text
        body = s[3]
        # keep only Name/Version/Location lines of each pip show output
        def cut(m):
            lines = m.group(1).split('\n')
            keep = [l for l in lines if re.match(r'^(Name|Version|Location|/|Required-by)', l)]
            return '<pre>' + '\n'.join(keep) + '</pre>'
        s[3] = re.sub(r'<pre>(.*?)</pre>', cut, body, flags=re.S)

CSS = """*{box-sizing:border-box}body{margin:0;background:#f2f1e9;color:#e6effa;font-family:'Roboto Mono',ui-monospace,SFMono-Regular,Menlo,monospace}
section{width:1100px;background:#09122e;margin:0 0 30px;border:2px solid #020835;display:flex;flex-direction:column}
header{display:flex;align-items:center;gap:22px;padding:22px 28px;background:#182643;font-size:19px}
header span{color:#6fb8e3;font-size:13px}header small{margin-left:auto;color:#acbfd8;font-size:12px}
.terminal{padding:24px 28px;flex:1}
.prompt{color:#8dccf1;font-size:15px;line-height:1.8;overflow-wrap:anywhere}
pre{font:15px/1.55 'Roboto Mono',ui-monospace,SFMono-Regular,Menlo,monospace;white-space:pre-wrap;overflow-wrap:anywhere;margin:8px 0 20px}
pre i{color:#8699ba}
.sep{color:#ffd28a;font-size:12px;letter-spacing:2px;margin:2px 0 14px}
.terminal>.sep+*{margin-top:0}
.sep+.sep,.terminal>*+.sep{border-top:1px dashed #35507a;padding-top:16px;margin-top:4px}
.g{color:#6ee7a0;font-weight:700}.b{font-weight:700}
footer{background:#182643;color:#acbfd8;padding:14px 28px;font-size:13px}"""

parts = ['<!doctype html><html lang="ru"><meta charset="utf-8"><title>Результаты запуска Student Tools</title>',
         '<link rel="preconnect" href="https://fonts.googleapis.com"><style>%s</style>' % CSS]
for sid, title, meta, body in SHOTS:
    parts.append(f'<section id="{sid}"><header><span>● ● ●</span><b>{html.escape(title)}</b>'
                 f'<small>{html.escape(meta)}</small></header><div class="terminal">{body}</div>'
                 f'<footer>Запись вывода команд в учебном окружении · не снимок окна VS Code</footer></section>')
parts.append('</html>')
out = pathlib.Path('/Users/makarovmn/algorthimization_course_vvodnoe/mdk0101-razrabotka-modulei/lessons/02-struktura-python-proekta/shots/evidence.html')
out.write_text(''.join(parts))
print('sections:', ', '.join(s[0] for s in SHOTS))
