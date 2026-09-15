"""Check local references, archive contents and the math of captured evidence."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
from zipfile import ZipFile
import csv,json,math,statistics,ast
R=Path(__file__).resolve().parents[1]
class Parser(HTMLParser):
 def __init__(self):super().__init__();self.ids=[];self.links=[];self.headings=0
 def handle_starttag(self,tag,attrs):
  d=dict(attrs)
  if 'id'in d:self.ids.append(d['id'])
  if tag=='h1':self.headings+=1
  for key in ['href','src']:
   if key in d:self.links.append(d[key])
parsed={}
for f in [R/'index.html',*R.glob('temy/*.html')]:
 p=Parser();p.feed(f.read_text());parsed[f]=p
 assert p.headings==1,f
 assert len(p.ids)==len(set(p.ids)),f
for f,p in parsed.items():
 for href in p.links:
  u=urlsplit(href)
  if u.scheme or u.netloc:continue
  dest=(f.parent/unquote(u.path)).resolve() if u.path else f
  assert dest.exists(),(f.name,href)
  if u.fragment and dest.suffix=='.html':
   q=parsed.get(dest)
   if q is None:q=Parser();q.feed(dest.read_text())
   assert unquote(u.fragment) in q.ids,(f.name,href)
print('10 HTML pages: headings, IDs, links and anchors OK')
rows=list(csv.DictReader((R/'lab/results/requests.csv').open()))
s=json.loads((R/'lab/results/summary.json').read_text())
events=json.loads((R/'lab/results/events.json').read_text())
assert len(rows)==20==len(events)
assert sum(int(r['status'])>=500 for r in rows)==s['errors']==1
assert [int(r['number']) for r in rows if r['scenario']=='slow']==[7,17]
v=sorted(float(r['client_ms']) for r in rows)
assert round(statistics.mean(v),3)==s['mean_ms']
assert v[math.ceil(.95*len(v))-1]==s['p95_nearest_rank_ms']
assert {r['request_id'] for r in rows}=={e['request_id'] for e in events}
for e in events:
 assert all(s['offset_ms']+s['duration_ms']<=e['duration_ms']+.01 for s in e['spans'])
print('20 recorded requests: counts, nearest-rank p95, mean, spans and request IDs OK')
with ZipFile(R/'assets/telemetry-lab.zip') as z:
 assert z.testzip() is None
 names=z.namelist()
 for name in ['app.py','requirements.txt','console.html','experiment.py','README.md','compose.yaml','reference-results/requests.csv']:
  assert 'telemetry-lab/'+name in names
 assert not any('__pycache__'in n or '.venv/'in n for n in names)
 assert z.read('telemetry-lab/app.py')==(R/'lab/app.py').read_bytes()
print('ZIP complete, source files synchronized, reference results preserved')
for f in R.rglob('*.py'):ast.parse(f.read_text(),filename=str(f))
print('Python syntax OK')
