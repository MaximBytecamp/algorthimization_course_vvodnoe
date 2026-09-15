from pathlib import Path
from playwright.sync_api import sync_playwright
from urllib.parse import quote
R=Path(__file__).resolve().parents[1]
with sync_playwright() as p:
 b=p.chromium.launch(headless=True)
 page=b.new_page(viewport={'width':1440,'height':1000},device_scale_factor=1)
 page.goto('http://127.0.0.1:9095/query?g0.expr='+quote('lab_http_requests_total')+'&g0.tab=1',wait_until='domcontentloaded',timeout=60000)
 page.get_by_role('button',name='Execute',exact=True).wait_for(timeout=45000)
 print(page.locator('body').inner_text()[:2500],flush=True)
 page.screenshot(path=str(R/'shots/prometheus-query.png'),clip={'x':0,'y':0,'width':1440,'height':470})
 page.goto('http://127.0.0.1:3015/d/telemetry-intro?orgId=1&from=now-15m&to=now&timezone=browser',wait_until='domcontentloaded',timeout=60000)
 page.get_by_text('Завершённые запросы · с запуска',exact=True).wait_for(timeout=45000)
 page.screenshot(path=str(R/'shots/grafana-dashboard.png'),full_page=True)
 print(page.locator('body').inner_text()[:2000],flush=True)
 b.close()
