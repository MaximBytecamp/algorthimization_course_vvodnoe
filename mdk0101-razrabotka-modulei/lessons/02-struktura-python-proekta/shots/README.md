# Как пересобрать снимки

1. `bash record-run.sh` — выполняет реальные команды темы во временной папке
   `/tmp/python-book-evidence/student-tools` и пишет протокол в `log.txt`.
2. `python3 build-shots.py` — собирает из протокола `evidence.html`.
3. Рендер PNG (нужен playwright):

```python
from playwright.sync_api import sync_playwright
import json, pathlib, re
ids = re.findall(r'<section id="([^"]+)"', pathlib.Path('evidence.html').read_text())
sizes = {}
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': 1200, 'height': 900}, device_scale_factor=2)
    pg.goto(pathlib.Path('evidence.html').resolve().as_uri()); pg.wait_for_timeout(500)
    for i in ids:
        el = pg.locator(f'section[id="{i}"]'); box = el.bounding_box()
        el.screenshot(path=f'{i}.png'); sizes[i] = [round(box['width']), round(box['height'])]
    b.close()
pathlib.Path('sizes.json').write_text(json.dumps(sizes, indent=1))
```

4. Размеры из `sizes.json` подставить в атрибуты `width`/`height` тегов `img` в главах.
   Текстовый протокол для студентов — `materials/run-evidence.txt`.

Пути в снимках относятся к записанному прогону: у студентов они будут другими.

## Кадры 25 и 26 (структура и запуск, глава 2.5)

Собираются отдельной парой скриптов, чтобы не перезаписывать основной протокол:

1. `bash record-run-structure.sh` — реальные команды в `/tmp/python-book-structure`;
2. `python3 build-shots-structure.py` — собирает `evidence-structure.html`;
3. рендер PNG тем же кодом, что и выше, но по файлу `evidence-structure.html`.

## Кадры 27-31 (главы 2.1, 2.4, 2.6-2.8)

1. `bash record-run-extra.sh && python3 build-shots-extra.py` — кадры 27 и 28;
2. `bash record-run-more.sh && python3 build-shots-more.py` — кадры 29, 30 и 31;
3. рендер PNG тем же кодом, что и выше, по файлам `evidence-extra.html` и `evidence-more.html`.
