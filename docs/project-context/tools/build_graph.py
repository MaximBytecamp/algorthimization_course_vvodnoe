"""Build a semantic Obsidian graph for the course repository.

The graph indexes disciplines and meaningful content units. It deliberately skips
individual images, archives, generated assets, dependencies, and cache directories.
Run from any directory:

    python3 docs/project-context/tools/build_graph.py
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
CONTEXT = ROOT / "docs" / "project-context"
GRAPH = CONTEXT / "graph"
ARCHIVE = CONTEXT / "archive" / "claude-memory"


@dataclass(frozen=True)
class Domain:
    slug: str
    title: str
    path: str
    memory_prefixes: tuple[str, ...]


DOMAINS = (
    Domain("observability", "Наблюдаемость", "observability", ("observability-",)),
    Domain("op03", "ОП.03 · Информационные технологии", "op03-informacionnye-tehnologii", ("op03-", "funnel-")),
    Domain("op04", "ОП.04 · Алгоритмизация", "op04-algoritmizaciya", ("op04-",)),
    Domain("op05", "ОП.05 · Операционные системы", "op05-operacionnye-sistemy-i-sredy", ("op05-", "os-")),
    Domain("dup02", "ДУП.02 · Введение в Python", "dup02-vvedenie-v-python", ("python-", "dup02-")),
    Domain("mdk0101", "МДК.01.01 · Разработка модулей", "mdk0101-razrabotka-modulei", ("mdk0101-",)),
    Domain("mdk0111", "МДК.01.11 · ADO.NET", "mdk0111-ado-net", ("mdk0111-",)),
    Domain("mdk0401", "МДК.04.01 · Базы данных", "mdk0401-razrabotka-i-zashchita-baz-dannyh", ("mdk0401-", "mongodb-")),
    Domain("angular-react", "Angular и React", "angular-react", ("angular-react-", "react-")),
    Domain("sysprog", "Системное программирование", "sistemnoe-programmirovanie", ("mdk0104-",)),
    Domain("standards", "Стандартизация и документирование", "standartizaciya-sertifikaciya-i-dokumentovedenie", ("ssd-", "api-standard-")),
    Domain("shared", "Общие материалы", "shared", ("repo-", "git-github-", "vscode-", "pages-", "instructions-", "nabor-", "vychitka-")),
)

CONTAINERS = {"lessons", "temy", "testy", "tests", "massivy", "stroki", "hesh", "proekty"}
SKIP_DIRS = {
    ".git", ".github", ".pytest_cache", ".venv", "__pycache__", "assets",
    "data", "files", "img", "img-full", "lib", "node_modules", "out",
    "outputs", "photos", "shots", "src", "stand", "stand-final", "tools",
}
ENTRY_NAMES = {
    "AGENTS.md", "AUTHORING.md", "LESSON.md", "PLAN.md", "README.md", "SOURCE.md",
    "build.py", "build.mjs", "compose.yaml", "compose.yml", "index.html",
}
SOURCE_SUFFIXES = {".md", ".html", ".py", ".js", ".mjs", ".yaml", ".yml", ".json"}


def note_link(name: str, label: str | None = None) -> str:
    return f"[[{name}|{label}]]" if label else f"[[{name}]]"


def markdown_path(path: Path) -> str:
    relative = path.relative_to(ROOT).as_posix()
    target = "../../../" + relative
    return f"[{relative}]({target})"


def title_from_path(path: Path) -> str:
    title = path.name.replace("_", " ").replace("-", " ")
    return re.sub(r"\s+", " ", title).strip()


def discover_units(domain_path: Path) -> list[Path]:
    units: list[Path] = []
    if not domain_path.is_dir():
        return units
    for child in sorted(domain_path.iterdir(), key=lambda p: p.name.casefold()):
        if not child.is_dir() or child.name.startswith(".") or child.name in SKIP_DIRS:
            continue
        if child.name in CONTAINERS:
            for unit in sorted(child.iterdir(), key=lambda p: p.name.casefold()):
                if unit.is_dir() and not unit.name.startswith(".") and unit.name not in SKIP_DIRS:
                    units.append(unit)
        else:
            units.append(child)
    return units


def entry_files(unit: Path) -> list[Path]:
    direct = [p for p in unit.iterdir() if p.is_file() and (p.name in ENTRY_NAMES or p.suffix in SOURCE_SUFFIXES)]
    preferred = sorted(direct, key=lambda p: (p.name not in ENTRY_NAMES, p.name.casefold()))
    if preferred:
        return preferred[:20]
    nested = [
        p for p in unit.rglob("*")
        if p.is_file()
        and p.suffix in SOURCE_SUFFIXES
        and not any(part in SKIP_DIRS or part.startswith(".") for part in p.relative_to(unit).parts[:-1])
    ]
    return sorted(nested, key=lambda p: p.as_posix().casefold())[:12]


def memory_notes(domain: Domain) -> list[Path]:
    result = []
    for path in ARCHIVE.glob("*.md"):
        if path.name == "MEMORY.md":
            continue
        if any(path.stem.startswith(prefix) for prefix in domain.memory_prefixes):
            result.append(path)
    return sorted(result, key=lambda p: p.name.casefold())


def unit_memory(unit: Path, notes: list[Path]) -> list[Path]:
    tokens = {token for token in re.split(r"[-_]+", unit.name.casefold()) if len(token) >= 3 and not token.isdigit()}
    matches = [note for note in notes if tokens and any(token in note.stem.casefold() for token in tokens)]
    return matches[:8]


def write(path: Path, text: str) -> None:
    path.write_text(text.rstrip() + "\n", encoding="utf-8")


def build_unit(domain: Domain, unit: Path, number: int, memories: list[Path]) -> str:
    filename = f"unit--{domain.slug}--{number:02d}--{unit.name}.md"
    domain_note = f"domain--{domain.slug}"
    lines = [
        "---",
        "type: project-unit",
        f"domain: {domain.slug}",
        "generated: true",
        "tags:",
        "  - project-graph/unit",
        f"  - project-graph/{domain.slug}",
        "---",
        "",
        f"# {domain.title} · {title_from_path(unit)}",
        "",
        f"Родительская область: {note_link(domain_note, domain.title)}",
        "",
        "## Путь",
        "",
        f"`{unit.relative_to(ROOT).as_posix()}`",
    ]
    files = entry_files(unit)
    if files:
        lines.extend(["", "## Точки входа", ""])
        lines.extend(f"- {markdown_path(path)}" for path in files)
    related = unit_memory(unit, memories)
    if related:
        lines.extend(["", "## Связанная память", ""])
        lines.extend(
            f"- {note_link('archive/claude-memory/' + note.stem, note.stem)}"
            for note in related
        )
    lines.extend(["", "_Узел создан автоматически. Факты о состоянии работы храните в тематической заметке или `CURRENT.md`._"])
    write(GRAPH / filename, "\n".join(lines))
    return Path(filename).stem


def build_domain(domain: Domain) -> str:
    domain_path = ROOT / domain.path
    memories = memory_notes(domain)
    units = discover_units(domain_path)
    unit_links = [build_unit(domain, unit, i, memories) for i, unit in enumerate(units, 1)]
    filename = f"domain--{domain.slug}.md"
    lines = [
        "---",
        "type: project-domain",
        f"domain: {domain.slug}",
        "generated: true",
        "tags:",
        "  - project-graph/domain",
        f"  - project-graph/{domain.slug}",
        "---",
        "",
        f"# {domain.title}",
        "",
        f"Родительский узел: {note_link('Карта проекта')}",
        "",
        "## Путь",
        "",
        f"`{domain.path}`",
    ]
    if unit_links:
        lines.extend(["", "## Модули и разделы", ""])
        lines.extend(f"- {note_link(link)}" for link in unit_links)
    top_files = [p for p in domain_path.iterdir() if p.is_file() and (p.name in ENTRY_NAMES or p.suffix in SOURCE_SUFFIXES)] if domain_path.is_dir() else []
    if top_files:
        lines.extend(["", "## Точки входа области", ""])
        lines.extend(f"- {markdown_path(path)}" for path in sorted(top_files, key=lambda p: p.name.casefold())[:20])
    if memories:
        lines.extend(["", "## Исторический контекст", ""])
        lines.extend(
            f"- {note_link('archive/claude-memory/' + note.stem, note.stem)}"
            for note in memories
        )
    write(GRAPH / filename, "\n".join(lines))
    return Path(filename).stem


def main() -> None:
    GRAPH.mkdir(parents=True, exist_ok=True)
    for pattern in ("domain--*.md", "unit--*.md"):
        for old in GRAPH.glob(pattern):
            old.unlink()

    domain_links = [build_domain(domain) for domain in DOMAINS]
    root = [
        "---",
        "type: project-map",
        "generated: true",
        "tags:",
        "  - project-graph/root",
        "---",
        "",
        "# Карта проекта",
        "",
        "Открывайте этот файл в Obsidian и переходите по связям от области к модулю.",
        "Граф индексирует смысловые единицы, но пропускает изображения, архивы, зависимости",
        "и служебные каталоги.",
        "",
        "## Оперативная память",
        "",
        f"- {note_link('CURRENT', 'Текущая работа')}",
        f"- {note_link('DECISIONS', 'Решения')}",
        f"- {note_link('CONSTRAINTS', 'Ограничения')}",
        f"- {note_link('BACKLOG', 'Согласованные задачи')}",
        f"- {note_link('EFFICIENCY', 'Экономия контекста')}",
        "",
        "## Области",
        "",
    ]
    root.extend(f"- {note_link(link)}" for link in domain_links)
    root.extend([
        "",
        "## Обновление",
        "",
        "```bash",
        "python3 docs/project-context/tools/build_graph.py",
        "```",
    ])
    write(GRAPH / "Карта проекта.md", "\n".join(root))
    print(f"Областей: {len(domain_links)}")
    print(f"Узлов модулей: {len(list(GRAPH.glob('unit--*.md')))}")
    print(f"Всего файлов графа: {len(list(GRAPH.glob('*.md')))}")


if __name__ == "__main__":
    main()
