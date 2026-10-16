"""Сборка трёх архивов Go-версии проекта «Отчёт кафе» для темы 04.

    python3 build_go.py

Исходник один — `src-go/`, в нём код с комментариями документации. Это
эталон. Остальные архивы получаются из него, поэтому код во всех трёх
совпадает строка в строку и расходиться не может.

На выходе:
    otchet-kafe-go-oshibki.zip      — двенадцать ошибок типов: практика 4.5
    otchet-kafe-go-start.zip        — без комментариев документации:
                                      практика по документации
    otchet-kafe-go-dokumentirovan.zip — эталон для сверки

В Go тип у параметра и результата обязателен, поэтому архива «без типов»,
как у Python, нет. Его место занимает архив с ошибками: код написан
«по-питоновски» и не собирается, пока типы не согласованы.
"""
import re
import shutil
import subprocess
import zipfile
from pathlib import Path

HERE = Path(__file__).parent
SRC = HERE / "src-go"
BUILD = HERE / "build-go"

COMMON_RUN = """## Запуск

Нужен Go 1.23 или новее. Команды выполняются из папки, в которой лежит
`go.mod`; в Windows, macOS и Linux они одинаковые.

    go build ./...                   # собрать все пакеты
    go run .                         # напечатать отчёт
    go test ./...                    # проверки
    go vet ./...                     # подозрительные места
"""

LAYOUT = """## Что в проекте

    main.go                точка входа: собирает и печатает отчёт
    internal/domain        заказ и смена: объекты предметной области
    internal/services      чтение файла, расчёты, запись отчёта
    internal/utils         форматирование сумм, заголовков, имён и даты
    internal/ui            печать отчёта в консоль
    data/smena.csv         файл смены: пять заказов трёх официантов
"""

OSHIBKI_README = f"""# Отчёт кафе (Go) — проект с ошибками типов

Код написан так, как его написал бы человек, привыкший к Python: функция
вызвана без аргумента, у которого «было значение по умолчанию», строка
склеивается с числом, из двух результатов взят один. Компилятор Go такой
код не собирает. Задача практики 4.5 — согласовать типы так, чтобы
`go build ./...` и `go vet ./...` прошли без сообщений, а отчёт совпал
с эталоном.

{COMMON_RUN}
Сейчас `go build ./...` печатает ошибки. Исправлять их удобно от пакетов,
которые ни от чего не зависят (`internal/utils`), к `main.go`.

## Ожидаемый вывод после исправления

    =========== Смена 21.09.2026 ===========
    Петрова Анна                  2 480,50 ₽
    Иванов Пётр                   1 685,00 ₽
    Сидоров Илья                    772,00 ₽
    =========== Итого 4 937,50 ₽ ===========

Дата в шапке — сегодняшняя.

{LAYOUT}"""

START_README = f"""# Отчёт кафе (Go) — стартовый проект

Рабочий код без комментариев документации. Задача второй части темы 04:
задокументировать каждый пакет и каждое экспортируемое имя и добиться,
чтобы `revive ./...` проходил без замечаний.

{COMMON_RUN}    revive ./...                     # сейчас замечания: документации нет

Ожидаемый вывод `go run .` — заголовок с сегодняшней датой, три строки
с официантами (Петрова Анна, Иванов Пётр, Сидоров Илья) и строка с итогом
4 937,50 ₽.

{LAYOUT}"""

DOC_README = f"""# Отчёт кафе (Go) — эталон с документацией

Тот же код, что в стартовом проекте, с комментариями документации у каждого
пакета и каждого экспортируемого имени и с примерами в
`internal/utils/example_test.go`. Используется для сверки в конце темы 04.

{COMMON_RUN}    revive ./...                     # замечаний нет
    go doc ./internal/services       # документация пакета в терминале
    go doc -all ./internal/utils     # пакет целиком

`go test ./...` выполняет 12 тестов и 2 примера: вывод примеров сверяется
со строками после `// Output:`.

{LAYOUT}"""

# Ошибки практики 4.5: (файл, как в эталоне, как в архиве с ошибками).
# Каждая замена даёт ровно одну ошибку компилятора.
ERRORS = [
    ("internal/utils/formatter.go",
     'return strings.Join(groups, " ") + "," + strconv.Itoa(cents/10) + strconv.Itoa(cents%10) + " ₽"',
     'return strings.Join(groups, " ") + "," + cents + " ₽"'),
    ("internal/utils/text.go",
     'return strings.Join(strings.Fields(value), " ")',
     'return strings.Join(strings.Fields(value))'),
    ("internal/utils/text.go",
     "runes[0] = unicode.ToUpper(runes[0])",
     "runes[0] = unicode.ToUpper(word[0])"),
    ("internal/domain/order.go",
     "return Order{}, ErrNegativeKopeks",
     "return nil, ErrNegativeKopeks"),
    ("internal/domain/shift.go",
     "s.Orders = append(s.Orders, order)",
     "s.Orders = append(s.Orders, &order)"),
    ("internal/services/calculator.go",
     "return math.Round(float64(sum)/float64(len(grades))*100) / 100, nil",
     "return math.Round(sum/len(grades)*100) / 100, nil"),
    ("internal/services/calculator.go",
     "return slices.Min(grades), slices.Max(grades), nil",
     "return slices.Min(grades), slices.Max(grades)"),
    ("internal/services/orders.go",
     "\t\tkopeks, err := strconv.Atoi(row[\"kopeks\"])\n\t\tif err != nil {\n\t\t\treturn nil, err\n\t\t}\n",
     "\t\tkopeks := strconv.Atoi(row[\"kopeks\"])\n"),
    ("internal/services/orders.go",
     "ranked = append(ranked, WaiterRevenue{Waiter: name, Kopeks: totals[name]})",
     "ranked = append(ranked, totals[name])"),
    ("internal/services/orders.go",
     "\tslices.SortStableFunc(orders, func(a, b domain.Order) int {\n\t\treturn b.Kopeks - a.Kopeks\n",
     "\tslices.SortStableFunc(orders, func(a, b domain.Order) int {\n\t\treturn a.Kopeks > b.Kopeks\n"),
    ("internal/services/report_file.go",
     "os.WriteFile(path, []byte(strings.Join(lines, \"\\n\")), 0o644)",
     "os.WriteFile(path, strings.Join(lines, \"\\n\"), 0o644)"),
    ("main.go",
     "services.RevenueByWaiter(orders, 0)",
     "services.RevenueByWaiter(orders)"),
]

# Комментарий документации стоит с начала строки перед объявлением,
# комментарий поля — в конце строки. Комментарии внутри тела функций
# начинаются с отступа и остаются: это не документация.
FULL_COMMENT = re.compile(r"^//.*\n", re.M)
TAIL_COMMENT = re.compile(r"(?<=\S)[ \t]+// .*$", re.M)


def strip_docs(text: str) -> str:
    """Убирает комментарии и лишние пустые строки, которые после них остались."""
    text = FULL_COMMENT.sub("", text)
    text = TAIL_COMMENT.sub("", text)
    return text.lstrip("\n")


def copy_tree(target: Path) -> None:
    shutil.rmtree(target, ignore_errors=True)
    shutil.copytree(SRC, target, ignore=shutil.ignore_patterns(".DS_Store"))


def make_start(target: Path) -> None:
    copy_tree(target)
    (target / "internal/utils/example_test.go").unlink()
    # doc.go хранит только комментарий пакета: без него файл пустой.
    for doc in target.rglob("doc.go"):
        doc.unlink()
    for path in target.rglob("*.go"):
        if path.name.endswith("_test.go"):
            continue
        path.write_text(strip_docs(path.read_text(encoding="utf-8")), encoding="utf-8")
    # gofmt выравнивает поля структур заново, когда комментарии справа сняты.
    subprocess.run(["gofmt", "-w", "."], cwd=target, check=True)


def make_oshibki(target: Path) -> None:
    make_start(target)
    for name, good, bad in ERRORS:
        path = target / name
        text = path.read_text(encoding="utf-8")
        assert text.count(good) == 1, (name, good)
        path.write_text(text.replace(good, bad), encoding="utf-8")


def pack(folder: Path, name: str, readme: str) -> None:
    (folder / "README.md").write_text(readme, encoding="utf-8")
    archive = HERE / f"{name}.zip"
    archive.unlink(missing_ok=True)
    with zipfile.ZipFile(archive, "w", zipfile.ZIP_DEFLATED) as zf:
        for path in sorted(folder.rglob("*")):
            if path.is_file():
                zf.write(path, Path(name) / path.relative_to(folder))
    print(archive.name)


def main() -> None:
    BUILD.mkdir(exist_ok=True)
    plan = [
        ("otchet-kafe-go-dokumentirovan", copy_tree, DOC_README),
        ("otchet-kafe-go-start", make_start, START_README),
        ("otchet-kafe-go-oshibki", make_oshibki, OSHIBKI_README),
    ]
    for name, make, readme in plan:
        folder = BUILD / name
        make(folder)
        pack(folder, name, readme)


if __name__ == "__main__":
    main()
