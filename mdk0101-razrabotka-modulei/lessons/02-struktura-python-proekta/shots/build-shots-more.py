"""Собирает снимки 29, 30 и 31 из протокола record-run-more.sh.

Запуск: bash record-run-more.sh && python3 build-shots-more.py
Дальше PNG рендерится так же, как остальные кадры (см. README.md).
"""

import html
import pathlib
import re

LOG = pathlib.Path("/tmp/python-book-more/log.txt").read_text()
blocks = {}
for m in re.finditer(r"##### (\S+)\n\$prompt ([^\n]*)\n\$cmd ([^\n]*)\n(.*?)##### end\n", LOG, re.S):
    bid, prompt, cmd, out = m.groups()
    out = out.replace("/private/tmp/", "/tmp/")
    blocks[bid] = {"prompt": prompt.strip(), "cmd": cmd.strip(), "out": out.rstrip("\n")}


def term(*items):
    parts = []
    for bid, shown in items:
        if bid == "--":
            parts.append(f'<div class="sep">{html.escape(shown)}</div>')
            continue
        b = blocks[bid]
        parts.append(f'<div class="prompt">{html.escape(b["prompt"])} {html.escape(shown)}</div>')
        body = html.escape(b["out"]) if b["out"].strip() else "<i>(команда завершилась без вывода)</i>"
        parts.append(f"<pre>{body}</pre>")
    return "".join(parts)


SHOTS = [
    ("29-activate-toggle", "Что меняет активация окружения", "macOS · Python 3.12 · реальный вывод",
     term(("--", "ОКРУЖЕНИЕ СОЗДАНО, НО НЕ АКТИВИРОВАНО"), ("m1-before", "which python3   +   проверка префикса"),
          ("--", "ПОСЛЕ АКТИВАЦИИ"), ("m2-after", "which python   +   проверка префикса"),
          ("--", "ПОСЛЕ deactivate"), ("m3-off", "which python3   +   проверка префикса"))),
    ("30-practice-files", "Архив практики: что внутри и почему рано запускать", "macOS · Python 3.12 · реальный вывод",
     term(("m4-files", "ls   +   ls python"), ("m5-early", "python 'запуск final.py'"))),
    ("31-homework-check", "Домашнее задание: как выглядит готовая работа", "macOS · Python 3.12 · реальный вывод",
     term(("m6-hw-run", "python -m app.main"), ("m7-hw-tests", "python -m unittest discover -s tests -v"))),
]

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
footer{background:#182643;color:#acbfd8;padding:14px 28px;font-size:13px}"""

parts = ['<!doctype html><html lang="ru"><meta charset="utf-8"><title>Активация, практика и домашнее задание</title>',
         "<style>%s</style>" % CSS]
for sid, title, meta, body in SHOTS:
    parts.append(f'<section id="{sid}"><header><span>● ● ●</span><b>{html.escape(title)}</b>'
                 f'<small>{html.escape(meta)}</small></header><div class="terminal">{body}</div>'
                 f'<footer>Запись вывода команд в учебном окружении · не снимок окна VS Code</footer></section>')
parts.append("</html>")
out = pathlib.Path(__file__).resolve().parent / "evidence-more.html"
out.write_text("".join(parts))
print("sections:", ", ".join(s[0] for s in SHOTS))
