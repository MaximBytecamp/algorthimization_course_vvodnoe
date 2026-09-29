"""Диаграммы последовательности для глав 2.4 и 2.5.

Каждая диаграмма — список участников и шагов. Шаг получает data-step,
и блок .seq в prom.js открывает шаги по одному. Результат пишется в
src/_seq-*.svg, а build.py вставляет его на место <!--include:…-->.

Запуск: python3 diagrams.py (build.py вызывает его сам).
"""

from html import escape
from pathlib import Path

SRC = Path(__file__).parent / "src"
W = 760


def seq(actors, steps, *, label, top=66, gap=40):
    """actors: [(x, имя)]; steps: (kind, from_x, to_x, текст[, 'data'])."""
    height = top + gap * len(steps) + 26
    out = [f'<svg class="seq__svg" viewBox="0 0 {W} {height}" role="img" aria-label="{escape(label)}">']
    for x, name in actors:
        out.append(f'<g class="actor"><rect x="{x - 88}" y="10" width="176" height="36" rx="4"/>'
                   f'<text x="{x}" y="33">{escape(name)}</text></g>')
        out.append(f'<line class="life" x1="{x}" x2="{x}" y1="46" y2="{height - 8}"/>')
    for k, st in enumerate(steps, start=1):
        kind, x1, x2, text = st[:4]
        extra = " data" if len(st) > 4 and st[4] == "data" else ""
        y = top + gap * (k - 1) + 14
        t = escape(text)
        if kind == "note":
            wdt = max(150, 7.1 * len(text) + 20)
            x = min(max(x1 - wdt / 2, 6), W - wdt - 6)
            out.append(f'<g class="note" data-step="{k}"><rect x="{x:.0f}" y="{y - 15}" width="{wdt:.0f}" height="26" rx="3"/>'
                       f'<text x="{x + 10:.0f}" y="{y + 3}">{t}</text></g>')
        else:
            d = 1 if x2 > x1 else -1
            tip = x2 - d * 2
            out.append(f'<g class="msg{extra}" data-step="{k}"><line x1="{x1}" y1="{y}" x2="{tip - d * 9}" y2="{y}"/>'
                       f'<polygon points="{tip},{y} {tip - d * 11},{y - 5} {tip - d * 11},{y + 5}"/>'
                       f'<text x="{(x1 + x2) / 2:.0f}" y="{y - 7}" text-anchor="middle">{t}</text></g>')
    out.append("</svg>")
    return "\n".join(out)


def main():
    P, A, T = 110, 380, 650
    (SRC / "_seq-scrape.svg").write_text(seq(
        [(P, "Prometheus"), (A, "api:8000"), (T, "TSDB")],
        [
            ("note", P, P, "прошло 15 с с прошлого сбора"),
            ("msg", P, A, "GET /metrics · Accept · timeout 10"),
            ("note", A, A, "generate_latest(registry)"),
            ("msg", A, P, "200 OK · text/plain · 3 строки", "data"),
            ("note", P, P, "разбор текста, + job и instance"),
            ("msg", P, T, "3 отсчёта, время = начало сбора", "data"),
            ("msg", P, T, "up = 1, scrape_duration_seconds, …", "data"),
            ("msg", P, T, "stale-метки рядам, которых нет в ответе"),
            ("note", P, P, "ждать следующего интервала"),
        ],
        label="Один scrape: Prometheus запрашивает /metrics у приложения и записывает отсчёты в TSDB",
    ), encoding="utf-8")

    M, A2 = 180, 580
    (SRC / "_seq-push.svg").write_text(seq(
        [(A2, "Приложение"), (M, "Сервер мониторинга")],
        [
            ("note", A2, A2, "в конфигурации: адрес сервера"),
            ("msg", A2, M, "POST · значения метрик", "data"),
            ("note", M, M, "записать то, что пришло"),
            ("msg", A2, M, "POST · значения метрик", "data"),
            ("note", A2, A2, "процесс упал: отправок нет"),
            ("note", M, M, "тишина: упал или нет событий?"),
        ],
        label="Push: приложение само отправляет значения серверу мониторинга",
    ), encoding="utf-8")

    (SRC / "_seq-pull.svg").write_text(seq(
        [(M, "Prometheus"), (A2, "Приложение")],
        [
            ("note", M, M, "в конфигурации: список target"),
            ("msg", M, A2, "GET /metrics"),
            ("msg", A2, M, "200 OK · текущие значения", "data"),
            ("note", M, M, "up = 1, записать отсчёты"),
            ("msg", M, A2, "GET /metrics"),
            ("note", A2, A2, "процесс упал: порт закрыт"),
            ("msg", A2, M, "connection refused", "data"),
            ("note", M, M, "up = 0: target недоступен"),
        ],
        label="Pull: Prometheus сам запрашивает значения у приложения и замечает, что оно недоступно",
    ), encoding="utf-8")
    print("диаграммы: 3")


if __name__ == "__main__":
    main()
