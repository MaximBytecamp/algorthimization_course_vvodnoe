"""Сверка примеров ветки Go с настоящим выводом компилятора и программ.

    python3 verify_go.py [путь к распакованному otchet-kafe-go-start]

В главах пример ветки Go — блок кода с подписью `proba/main.go`, за которым
идёт блок вывода с подписью-командой: `go run ./proba`, `go build ./proba`
или `go vet ./proba`. Скрипт вынимает оба блока из разметки, записывает код
в proba/main.go внутри проекта, выполняет ту же команду и сравнивает ответ
с напечатанным в книге построчно. Расхождений должно быть ноль.

Без аргумента проект распаковывается из архива темы во временную папку.
"""
import html
import re
import shutil
import subprocess
import sys
import zipfile
from pathlib import Path

BOOK = Path(__file__).resolve().parent.parent
CHAPTERS = sorted(p.name for p in BOOK.glob("[01][0-9]-*.html"))
FIGURE = re.compile(r'<figure class="code( code--out)?">\s*<figcaption><span>(.*?)</span><span>(.*?)</span></figcaption>\s*<pre>(.*?)</pre>', re.S)
COMMANDS = ("go run ./proba", "go build ./proba", "go vet ./proba")


# В выводе паники адреса памяти меняются от запуска к запуску: pc=0x…, +0x…
ADDRESS = re.compile(r"0x[0-9a-f]+")


def same(a: str, b: str) -> bool:
    return ADDRESS.sub("0x…", a) == ADDRESS.sub("0x…", b)


def text(fragment: str) -> str:
    return html.unescape(re.sub(r"<[^>]+>", "", fragment))


def pairs(page: str):
    """Пары «код proba/main.go → вывод команды» в порядке появления."""
    figures = [(bool(m[1]), text(m[2]), text(m[3]), text(m[4])) for m in FIGURE.finditer(page)]
    for (out_a, name_a, _, code), (out_b, _, command, shown) in zip(figures, figures[1:]):
        if not out_a and name_a == "proba/main.go" and out_b and command in COMMANDS:
            yield code, command, shown


def unpack() -> Path:
    target = Path("/private/tmp/student-go")
    shutil.rmtree(target, ignore_errors=True)
    with zipfile.ZipFile(BOOK / "materials/otchet-kafe-go-start.zip") as zf:
        zf.extractall(target)
    return target / "otchet-kafe-go-start"


def main() -> None:
    project = Path(sys.argv[1]) if len(sys.argv) > 1 else unpack()
    proba = project / "proba"
    proba.mkdir(exist_ok=True)
    total = bad = 0
    for chapter in CHAPTERS:
        page = (BOOK / chapter).read_text(encoding="utf-8")
        for code, command, shown in pairs(page):
            total += 1
            (proba / "main.go").write_text(code.rstrip() + "\n", encoding="utf-8")
            run = subprocess.run(command.split(), cwd=project, capture_output=True, text=True)
            got = (run.stdout + run.stderr).rstrip()
            if command.startswith("go vet"):
                # Анализаторы vet работают параллельно, порядок строк меняется.
                got = "\n".join(sorted(got.splitlines(), key=lambda line: [int(n) if n.isdigit() else n for n in re.split(r"(\d+)", line)]))
            if not same(got, shown.rstrip()):
                bad += 1
                first = next((s for s in code.splitlines() if s.startswith("func ") or "(" in s), code[:60])
                print(f"✗ {chapter}: {first[:70]}")
                print("  в книге:\n    " + shown.rstrip().replace("\n", "\n    "))
                print("  на деле:\n    " + got.replace("\n", "\n    "))
    shutil.rmtree(proba, ignore_errors=True)
    print(f"Примеров Go: {total}, расхождений: {bad}")
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
