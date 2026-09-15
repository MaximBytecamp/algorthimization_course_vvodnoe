"""Снимки Prometheus и Grafana стенда: Targets, таблица, график, дашборд. Нужен docker compose up."""
from pathlib import Path
from urllib.parse import quote
from playwright.sync_api import sync_playwright

R = Path(__file__).resolve().parents[1]
PROM = 'http://127.0.0.1:9095'
with sync_playwright() as p:
    b = p.chromium.launch(headless=True)
    page = b.new_page(viewport={'width': 1440, 'height': 1000}, device_scale_factor=1)

    page.goto(PROM + '/targets', wait_until='domcontentloaded', timeout=60000)
    page.get_by_text('telemetry-lab', exact=False).first.wait_for(timeout=45000)
    page.wait_for_timeout(1500)
    page.screenshot(path=str(R / 'shots/prometheus-targets.png'), clip={'x': 0, 'y': 0, 'width': 1440, 'height': 520})

    page.goto(PROM + '/query?g0.expr=' + quote('lab_http_requests_total') + '&g0.tab=1', wait_until='domcontentloaded', timeout=60000)
    page.get_by_role('button', name='Execute', exact=True).wait_for(timeout=45000)
    page.wait_for_timeout(1500)
    page.screenshot(path=str(R / 'shots/prometheus-query.png'), clip={'x': 0, 'y': 0, 'width': 1440, 'height': 470})

    expr = 'sum by (status) (rate(lab_http_requests_total[1m]))'
    page.goto(PROM + '/query?g0.expr=' + quote(expr) + '&g0.tab=0&g0.range_input=5m', wait_until='domcontentloaded', timeout=60000)
    page.get_by_role('button', name='Execute', exact=True).wait_for(timeout=45000)
    page.wait_for_timeout(2500)
    page.screenshot(path=str(R / 'shots/prometheus-graph.png'), clip={'x': 0, 'y': 0, 'width': 1440, 'height': 760})

    page.goto('http://127.0.0.1:3015/d/telemetry-intro?orgId=1&from=now-5m&to=now&timezone=browser', wait_until='domcontentloaded', timeout=60000)
    page.get_by_text('Завершённые запросы · с запуска', exact=True).wait_for(timeout=45000)
    page.wait_for_timeout(3000)
    page.screenshot(path=str(R / 'shots/grafana-dashboard.png'), full_page=True)
    b.close()
print('Captured Prometheus targets, table, graph and Grafana dashboard')
