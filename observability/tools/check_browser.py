from pathlib import Path
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[1]
base='http://127.0.0.1:8765/observability/'
with sync_playwright() as p:
 b=p.chromium.launch(headless=True)
 page=b.new_page(viewport={'width':1440,'height':1050})
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 for width in [1440,390,320]:
  page.set_viewport_size({'width':width,'height':1050 if width==1440 else 844})
  for f in [R/'index.html',*sorted(R.glob('temy/*.html'))]:
   relative=f.relative_to(R).as_posix()
   page.goto(base+relative,wait_until='domcontentloaded')
   page.wait_for_function('document.readyState === "complete"')
   overflow=page.evaluate('document.documentElement.scrollWidth > innerWidth')
   if overflow:
    bad=page.evaluate('Array.from(document.querySelectorAll("body *")).filter(e=>e.getBoundingClientRect().right>innerWidth+1).map(e=>[e.tagName,e.className,e.getBoundingClientRect().right]).slice(0,12)')
    raise AssertionError((width,relative,bad))
   assert page.locator('h1').count()==1
   if relative=='index.html' and width in [1440,390]:page.screenshot(path=f'/tmp/observability-cover-{width}.png')
   if '04-metrics' in relative:
    page.get_by_role('button',name='По длительности',exact=True).click()
    assert page.locator('.duration-chart button').count()==20
    page.locator('.duration-chart button').nth(18).click()
    assert '3024.239' in page.locator('.quantile .widget-detail').inner_text()
    if width in [1440,390]:page.locator('.quantile').screenshot(path=f'/tmp/observability-metrics-{width}.png')
   if '01-posle' in relative:
    page.get_by_role('button',name='После развёртывания',exact=True).click()
    assert page.locator('.system-route>span').count()==5
    page.locator('.zoom').first.click()
    assert page.locator('dialog').is_visible()
    page.get_by_role('button',name='Закрыть изображение').click()
    assert not page.locator('dialog').is_visible()
   if '02-monitoring' in relative:
    page.get_by_role('button',name='Резкий рост',exact=True).click()
    assert '20 → 23' in page.locator('.history .widget-detail').inner_text()
   if '05-logs' in relative:
    page.get_by_role('button',name='request_id',exact=True).click()
    assert 'Связывает' in page.locator('.log-anatomy .widget-detail').inner_text()
   if '06-traces' in relative:
    page.get_by_role('button',name='Следующий этап →',exact=True).click()
    page.get_by_role('button',name='Следующий этап →',exact=True).click()
    assert 'dependency.wait' in page.locator('.waterfall .widget-detail').inner_text()
    if width==1440:page.locator('.waterfall').screenshot(path='/tmp/observability-waterfall.png')
   if '07-rassledovanie' in relative:
    for _ in range(4):page.get_by_role('button',name='Следующее свидетельство →',exact=True).click()
    assert page.locator('.step-count').inner_text()=='5 / 5'
    for fs in page.locator('.signal-exercise fieldset').all():
     for value in fs.get_attribute('data-answer').split(','):fs.locator('input[value="'+value+'"]').check()
    page.get_by_role('button',name='Проверить выбор',exact=True).click()
    assert '3 из 3' in page.locator('.exercise-score').inner_text()
   if '08-prometheus' in relative:
    page.get_by_role('button',name='Следующий шаг →',exact=True).click()
    assert 'HTTP GET' in page.locator('.scrape .widget-detail').inner_text()
   if '09-praktika' in relative:
    page.get_by_role('button',name='Windows · PowerShell',exact=True).click()
    assert page.locator('[data-command="windows"]').is_visible()
    assert '\\Scripts\\python.exe' in page.locator('[data-command="windows"]').inner_text()
  print(width,'px: all pages and interactions OK',flush=True)
 nojs=b.new_context(java_script_enabled=False,viewport={'width':390,'height':844})
 np=nojs.new_page();np.goto(base+'temy/05-logs.html');np.locator('.selfcheck summary').first.click()
 assert np.locator('.selfcheck details').first.get_attribute('open') is not None
 print('No-JS narrative and native disclosures OK',flush=True)
 assert not errors,errors
 page.goto(base+'temy/08-prometheus-grafana.html')
 for img in page.locator('.evidence img').all():
  img.scroll_into_view_if_needed();page.wait_for_function('(img)=>img.complete && img.naturalWidth>0',arg=img.element_handle())
 print('All chapter-1.8 screenshots load',flush=True)
 b.close()
