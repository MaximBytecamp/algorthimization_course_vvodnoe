# Происхождение снимков

Все PNG — реальные кадры дисплея виртуальной машины, без генерации или перерисовки терминала.

- Дата: 6 октября 2026 года по времени виртуальной машины (UTC).
- VM: Ubuntu-lab-01, VirtualBox 7.2 на macOS ARM64.
- Ubuntu Desktop 24.04.4 LTS ARM64, Live-сеанс с установочного ISO; кадры сняты после кадров занятия 6, поэтому текущий каталог в приглашении — `~/perm-lab`.
- Пользователь: ubuntu; оболочка Bash; локаль C.UTF-8.
- Экран: 1280 × 800; окно GNOME Terminal развёрнуто.
- Снимки: `VBoxManage controlvm Ubuntu-lab-01 screenshotpng`; клавиши Ctrl+Z и Ctrl+C — `keyboardputscancode`.
- Ввод команд: `VBoxManage controlvm … keyboardputstring` построчно с паузой; перед каждым кадром — Ctrl+L и `clear`.
- Между кадрами (не снималось) задания предыдущего кадра снимались командой `kill -9 $(jobs -p); pkill -u ubuntu -x sleep; pkill -u ubuntu -x yes`, чтобы нумерация заданий начиналась с 1.
- Перед кадром 12-lab-check таблица `~/procs-lab/states.md` записана командой `printf` (в задании её пишут в редакторе).
- Скрипты `procs-lab-setup.sh` и `procs-lab-check.sh` скопированы в `~/Downloads` из каталога `materials` урока.

Номера PID и время в вашей системе будут другими.

## Кадры и выполненные команды

### 01-process.png

```bash
ls -l /usr/bin/sleep
sleep 300 &
sleep 301 &
pgrep -a sleep
ps -p $! -o pid,ppid,user,stat,etime,cmd
head -9 /proc/$!/status
readlink /proc/$!/exe
```

### 02-tree.png

```bash
echo $$
bash -c 'sleep 200; echo done' &
ps -o pid,ppid,stat,cmd
pstree -p $$
ps -p 1 -o pid,ppid,user,cmd
```

### 03-states.png

```bash
yes > /dev/null &
sleep 500 &
bash -c 'sleep 1 & exec sleep 300' &
sleep 2
sleep 600
# клавиши: Ctrl+Z
ps -o pid,ppid,stat,cmd
ps -eo stat= | cut -c1 | sort | uniq -c
```

### 04-jobs.png

```bash
sleep 1000
# клавиши: Ctrl+Z
jobs -l
bg %1
jobs
fg %1
# клавиши: Ctrl+C
jobs
```

### 05-kill.png

```bash
kill -l | head -3
sleep 900 &
kill $!; sleep 0.5
sleep 901 &
kill -9 $!; sleep 0.5
kill 1
```

### 06-stop-cont.png

```bash
yes > /dev/null &
ps -o pid,stat,%cpu,cmd -p $!
kill -STOP $!
ps -o pid,stat,%cpu,cmd -p $!
kill -CONT $!
ps -o pid,stat,%cpu,cmd -p $!
kill $!; sleep 0.5
pgrep -a yes
```

### 07-trap.png

```bash
bash -c 'trap "echo got TERM, keep working" TERM; while true; do sleep 1; done' &
kill $!; sleep 1.5
ps -o pid,stat,cmd -p $!
kill -9 $!; sleep 0.5
ps -o pid,stat,cmd -p $!
```

### 08-exit.png

```bash
true; echo $?
false; echo $?
ls /nope; echo $?
sleep 100
# клавиши: Ctrl+C
echo $?
sleep 100 & kill $!; wait $!; echo $?
sleep 100 & kill -9 $!; wait $!; echo $?
```

### 09-zombie.png

```bash
bash -c 'sleep 1 & exec -a lab-parent sleep 300' &
sleep 2
ps -o pid,ppid,stat,cmd --ppid $! -p $!
kill -9 $(pgrep -P $!)
ps -o pid,ppid,stat,cmd --ppid $!
kill $!; sleep 0.5
ps -o pid,ppid,stat,cmd --ppid $!
```

### 10-lab-tree.png

```bash
bash ~/Downloads/procs-lab-setup.sh
python3 ~/procs-lab/bin/manager.py &
sleep 2
M=$(pgrep -f procs-lab/bin/manager.py)
pstree -p $M
ps -o pid,ppid,stat,%cpu,cmd --ppid $M
ps -o pid,ppid,stat,cmd --ppid $(pgrep -f lab-parent)
```

### 11-lab-signals.png

```bash
H=$(pgrep -f bin/hog.sh); kill -STOP $H; ps -o pid,stat,cmd -p $H
kill -CONT $H; kill $H
P=$(pgrep -f bin/paused.sh); kill -CONT $P; kill $P
S=$(pgrep -f bin/stubborn.sh); kill $S; sleep 1.5; cat ~/procs-lab/stubborn.log
kill -9 $S
Z=$(pgrep -P $(pgrep -f lab-parent)); kill -9 $Z; ps -o pid,stat,cmd -p $Z
kill $(pgrep -f lab-parent)
kill $(pgrep -f bin/worker.sh); sleep 1
cat ~/procs-lab/exit-codes.log
pgrep -af procs-lab
```

### 12-lab-check.png

```bash
cat ~/procs-lab/states.md
bash ~/Downloads/procs-lab-check.sh
```
