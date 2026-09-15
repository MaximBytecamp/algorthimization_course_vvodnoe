"""Снимки учебного API: консоль, Swagger, /metrics и /health. Запуск после старта lab.

python3 tools/capture.py          — все снимки
python3 tools/capture.py swagger  — только Swagger
"""
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
SHOTS = ROOT / 'shots'
SHOTS.mkdir(exist_ok=True)
ONLY = set(sys.argv[1:])
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1440, 'height': 1080}, device_scale_factor=1)
    if not ONLY:
        page.goto('http://127.0.0.1:8015/lab')
        for scenario, label in [('fast', 'Быстрый 200'), ('slow', 'Медленный 200'), ('error', 'Ошибка 500')]:
            page.get_by_role('button', name=label, exact=True).click()
            page.wait_for_function("document.querySelector('#status').textContent.startsWith('HTTP')", timeout=15000)
            page.wait_for_function("!document.querySelector('button').disabled")
            page.screenshot(path=str(SHOTS / f'api-{scenario}.png'), full_page=True)
    if not ONLY or 'swagger' in ONLY:
        page.goto('http://127.0.0.1:8015/docs', wait_until='networkidle')
        page.locator('#operations-Эксперимент-products_products_get').click()
        # Раздел раскрывается асинхронно: ждём таблицу параметров, иначе на снимке индикатор загрузки.
        page.locator('.parameters-container .parameter__name', has_text='scenario').wait_for(timeout=15000)
        page.wait_for_timeout(500)
        page.screenshot(path=str(SHOTS / 'fastapi-swagger.png'), full_page=True)
    if not ONLY:
        # Текстовые ответы браузер показывает как есть — это и нужно разобрать в главах.
        page.set_viewport_size({'width': 1100, 'height': 520})
        page.goto('http://127.0.0.1:8015/metrics')
        page.screenshot(path=str(SHOTS / 'api-metrics.png'))
        page.set_viewport_size({'width': 1100, 'height': 160})
        page.goto('http://127.0.0.1:8015/health')
        page.screenshot(path=str(SHOTS / 'api-health.png'))
    browser.close()
print('Captured', ', '.join(sorted(ONLY)) or 'API console, Swagger, /metrics and /health')
