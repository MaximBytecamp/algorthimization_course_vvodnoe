from pathlib import Path
from zipfile import ZipFile,ZIP_DEFLATED
ROOT=Path(__file__).resolve().parents[1]
with ZipFile(ROOT/'assets/telemetry-lab.zip','w',ZIP_DEFLATED) as z:
 for f in sorted((ROOT/'lab').rglob('*')):
  if not f.is_file() or '__pycache__' in f.parts or '.venv' in f.parts or f.suffix=='.pyc':continue
  relative=f.relative_to(ROOT/'lab')
  if relative.parts[0]=='results':relative=Path('reference-results')/Path(*relative.parts[1:])
  z.write(f,Path('telemetry-lab')/relative)
 z.write(ROOT/'assets/investigation.md','telemetry-lab/investigation.md')
print('Packaged lab with preserved reference-results')
