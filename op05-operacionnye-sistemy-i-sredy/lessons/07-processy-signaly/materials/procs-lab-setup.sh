#!/bin/bash
# Учебный набор к занятию 7 ОП.05 «Процессы: PID, состояния и сигналы».
# Создаёт ~/procs-lab с программами набора. Диспетчер manager.py запускается вручную из своего терминала
# и порождает процессы в разных состояниях. Повторный запуск сначала завершает прежний набор.
LAB="$HOME/procs-lab"
pkill -KILL -f "procs-lab/bin/" 2>/dev/null; pkill -KILL -f lab-parent 2>/dev/null
rm -rf "$LAB"; mkdir -p "$LAB/bin"
cd "$LAB"

cat > bin/worker.sh <<'X'
#!/bin/bash
# Работает спокойно: раз в 5 секунд пишет время в журнал и спит.
while true; do date +%T >> "$HOME/procs-lab/worker.log"; sleep 5; done
X
cat > bin/hog.sh <<'X'
#!/bin/bash
# Бесконечный пустой цикл: занимает процессор целиком.
while :; do :; done
X
cat > bin/stubborn.sh <<'X'
#!/bin/bash
# Перехватывает сигнал TERM и продолжает работу.
trap 'echo "TERM ignored at $(date +%T)" >> "$HOME/procs-lab/stubborn.log"' TERM
while true; do sleep 1; done
X
cat > bin/paused.sh <<'X'
#!/bin/bash
# Обычный процесс; диспетчер останавливает его сразу после запуска.
while true; do sleep 2; done
X
cat > bin/manager.py <<'X'
#!/usr/bin/env python3
# Диспетчер: запускает процессы набора, записывает, как завершился каждый,
# и выходит сам, когда потомков не осталось.
import os, signal, subprocess
D = os.path.expanduser('~/procs-lab')
names = {}
for n in ('worker', 'hog', 'stubborn', 'paused'):
    p = subprocess.Popen(['bash', f'{D}/bin/{n}.sh'])
    names[p.pid] = n
    if n == 'paused':
        os.kill(p.pid, signal.SIGSTOP)
p = subprocess.Popen(['bash', '-c', 'sleep 1 & exec -a lab-parent sleep 100000'])
names[p.pid] = 'lab-parent'
with open(f'{D}/exit-codes.log', 'a') as log:
    while names:
        pid, status = os.waitpid(-1, 0)
        how = f'signal {os.WTERMSIG(status)}' if os.WIFSIGNALED(status) else f'exit {os.WEXITSTATUS(status)}'
        log.write(f'{names.pop(pid, pid)} {pid} {how}\n')
        log.flush()
X
chmod +x bin/*.sh bin/manager.py
echo "Ready: $LAB"
echo "Start the manager from this terminal: python3 ~/procs-lab/bin/manager.py &"
