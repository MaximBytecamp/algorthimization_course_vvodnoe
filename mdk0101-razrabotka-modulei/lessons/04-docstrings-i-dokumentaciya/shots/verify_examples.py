"""Сверка примеров глав 4.1, 4.3–4.5 с настоящим выводом mypy и Python.

    python3 verify_examples.py [путь к проекту второго архива]

В главах пример — это блок кода с подписью `proba.py`, за которым идёт блок
вывода с подписью `mypy proba.py` или `python proba.py`. Скрипт вынимает оба
блока из разметки, записывает код в proba.py в корне проекта, запускает ту же
команду и сравнивает ответ с напечатанным в книге построчно. Расхождений
должно быть ноль: в книгу попадает только настоящий вывод.
"""
import html
import re
import subprocess
import sys
from pathlib import Path

BOOK = Path(__file__).resolve().parent.parent
# Глава 4.2 «Типы в аннотациях» оставлена в прежнем виде по просьбе автора:
# в ней фрагменты файлов, а не файлы целиком, и сверять их запуском нельзя.
CHAPTERS = ["01-annotacii-tipov.html", "03-proverka-tipov.html",
            "04-tipy-na-primerah.html", "05-praktika-annotacii.html"]
FIGURE = re.compile(r'<figure class="code( code--out)?">\s*<figcaption><span>(.*?)</span><span>(.*?)</span></figcaption>\s*<pre>(.*?)</pre>', re.S)


def text(fragment: str) -> str:
    return html.unescape(re.sub(r"<[^>]+>", "", fragment))


def pairs(page: str):
    """Пары «код proba.py → вывод команды» в порядке появления на странице."""
    figures = [(bool(m[1]), text(m[2]), text(m[3]), text(m[4])) for m in FIGURE.finditer(page)]
    for (out_a, name_a, _, code), (out_b, _, command, shown) in zip(figures, figures[1:]):
        if not out_a and name_a == "proba.py" and out_b and command in ("mypy proba.py", "python proba.py"):
            yield code, command, shown


def main() -> None:
    project = Path(sys.argv[1] if len(sys.argv) > 1 else "/private/tmp/student/otchet-kafe-start")
    proba = project / "proba.py"
    total = bad = 0
    for chapter in CHAPTERS:
        page = (BOOK / chapter).read_text(encoding="utf-8")
        for code, command, shown in pairs(page):
            total += 1
            proba.write_text(code.rstrip() + "\n", encoding="utf-8")
            tool = ".venv/bin/mypy" if command.startswith("mypy") else ".venv/bin/python"
            run = subprocess.run([tool, "proba.py"], cwd=project, capture_output=True, text=True)
            got = (run.stdout + run.stderr).rstrip()
            if command.startswith("python"):
                # Из трассировки в книгу идёт только последняя строка.
                got = "\n".join(got.splitlines()[-len(shown.splitlines()):])
            if got != shown.rstrip():
                bad += 1
                print(f"✗ {chapter}: {code.splitlines()[0][:60]}")
                print("  в книге:\n    " + shown.rstrip().replace("\n", "\n    "))
                print("  на деле:\n    " + got.replace("\n", "\n    "))
    proba.unlink(missing_ok=True)
    print(f"Примеров: {total}, расхождений: {bad}")
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
