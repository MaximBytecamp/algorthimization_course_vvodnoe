"""Съёмка действующих страниц; запуск после старта lab и optional compose."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json
ROOT=Path(__file__).resolve().parents[1]
SHOTS=ROOT/'shots'
SHOTS.mkdir(exist_ok=True)
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    page=browser.new_page(viewport={'width':1440,'height':1080},device_scale_factor=1)
    page.goto('http://127.0.0.1:8015/lab')
    for scenario,label in [('fast','Быстрый 200'),('slow','Медленный 200'),('error','Ошибка 500')]:
        page.get_by_role('button',name=label,exact=True).click()
        page.get_by_role('button',name=label,exact=True).wait_for(state='visible')
        page.wait_for_function("!document.querySelector('button').disabled")
        page.screenshot(path=str(SHOTS/f'api-{scenario}.png'),full_page=True)
    page.goto('http://127.0.0.1:8015/docs',wait_until='networkidle')
    page.locator('#operations-Эксперимент-products_products_get').click()
    page.screenshot(path=str(SHOTS/'fastapi-swagger.png'),full_page=True)
    # Official documentation screenshots are captured as rendered, not rebuilt.
    for name,url in [('otel-signals','https://opentelemetry.io/docs/concepts/signals/'),('prometheus-architecture','https://prometheus.io/docs/introduction/overview/')]:
        try:
            page.goto(url,wait_until='domcontentloaded',timeout=45000)
            if name=='otel-signals': page.get_by_role('heading',name='Signals',exact=True).scroll_into_view_if_needed()
            else: page.get_by_role('heading',name='Architecture',exact=True).evaluate('(el) => window.scrollTo(0, el.getBoundingClientRect().top + scrollY - 145)')
            page.screenshot(path=str(SHOTS/f'{name}.png'))
        except Exception as e: print(name,str(e)[:200],flush=True)
    browser.close()
print('Captured actual API, Swagger and documentation pages')
