#!/bin/bash
# Учебный набор к занятию 8 ОП.05 «Диагностика процессов и управление ресурсами».
# Создаёт ~/diag-lab со службами учебного сервера и диспетчером incident.py.
# Диспетчер запускается вручную из своего терминала. Повторный запуск сначала завершает прежний набор.
LAB="$HOME/diag-lab"
pkill -KILL -f "diag-lab/bin/" 2>/dev/null
rm -rf "$LAB"; mkdir -p "$LAB/bin"
cd "$LAB"

cat > bin/web-worker.sh <<'X'
#!/bin/bash
# Учебный веб-сервер: раз в секунду обрабатывает «запрос» и пишет, сколько миллисекунд он занял.
L="$HOME/diag-lab"
while true; do
  s=$(date +%s%N)
  for ((i = 0; i < 60000; i++)); do :; done
  echo "$(date +%T) request $(( ($(date +%s%N) - s) / 1000000 )) ms" >> "$L/web.log"
  sleep 1
done
X
cat > bin/report-builder.sh <<'X'
#!/bin/bash
# Построитель отчётов: запускает по два расчёта на каждое ядро и ждёт их. Ошибка: расчёт никогда не заканчивается.
for n in $(seq $(( $(nproc) * 2 ))); do
  bash "$HOME/diag-lab/bin/report-calc.sh" $n &
done
wait
X
cat > bin/report-calc.sh <<'X'
#!/bin/bash
# Один расчёт отчёта: считает без остановки и после каждого круга пишет в журнал свой приоритет nice.
while true; do
  for ((i = 0; i < 300000; i++)); do :; done
  echo "$(date +%T) calc $1 pid $$ nice=$(ps -o ni= -p $$ | tr -d ' ')" >> "$HOME/diag-lab/report.log"
done
X
cat > bin/sync-agent.sh <<'X'
#!/bin/bash
# Агент синхронизации: берёт блокировку и зависает. На TERM не реагирует.
L="$HOME/diag-lab"
echo $$ > "$L/sync.lock"
echo "$(date +%T) sync started, waiting for remote" >> "$L/sync.log"
trap '' TERM
while true; do sleep 5; done
X
cat > bin/incident.py <<'X'
#!/usr/bin/env python3
# Диспетчер учебного сервера: запускает службы и записывает, как завершилась каждая.
import os, subprocess
D = os.path.expanduser('~/diag-lab')
names = {}
for n in ('web-worker', 'report-builder', 'sync-agent'):
    p = subprocess.Popen(['bash', f'{D}/bin/{n}.sh'])
    names[p.pid] = n
with open(f'{D}/exit-codes.log', 'a') as log:
    while names:
        pid, status = os.waitpid(-1, 0)
        how = f'signal {os.WTERMSIG(status)}' if os.WIFSIGNALED(status) else f'exit {os.WEXITSTATUS(status)}'
        log.write(f'{names.pop(pid, pid)} {pid} {how}\n')
        log.flush()
X
cat > postmortem.md <<'X'
# Postmortem · учебный сервер diag-lab

## Симптом

## Причина

## Действия

## Профилактика
X
chmod +x bin/*
echo "Ready: $LAB"
echo "Start the server from this terminal: python3 ~/diag-lab/bin/incident.py &"
