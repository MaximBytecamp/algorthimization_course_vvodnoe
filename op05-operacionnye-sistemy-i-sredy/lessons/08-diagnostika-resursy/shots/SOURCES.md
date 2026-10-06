# Происхождение снимков

Все PNG — реальные кадры дисплея виртуальной машины, без генерации или перерисовки терминала.

- Дата: 6 октября 2026 года по времени виртуальной машины (UTC).
- VM: Ubuntu-lab-01, VirtualBox 7.2 на macOS ARM64, два виртуальных ядра, 6 ГБ памяти.
- Ubuntu Desktop 24.04.4 LTS ARM64, Live-сеанс с установочного ISO, загружен заново перед съёмкой; htop входит в образ.
- Пользователь: ubuntu; оболочка Bash; экран 1280 × 800; окно GNOME Terminal развёрнуто.
- Снимки: `VBoxManage controlvm Ubuntu-lab-01 screenshotpng`; ввод — `keyboardputstring` построчно с паузой, клавиша q для выхода из htop — `keyboardputscancode`. Перед каждым кадром — Ctrl+L и `clear`.
- Под нагрузкой ввод шёл медленнее (по 12 символов с паузой), иначе буфер клавиатуры VirtualBox переполняется.
- Пяти- и пятнадцатиминутная нагрузка на кадре 01 выше нуля: перед съёмкой в машине проверялся учебный сервер.
- После кадра 03 (не снималось) фоновый yes завершён командой `kill %1`, как сказано в тексте.
- Кадр 04 переснят отдельно; перед ним (не снималось) остановлен учебный сервер прошлой попытки.
- Перед кадром 10 (не снималось) учебный сервер пройден заново теми же командами, что на кадрах 08–09, а `~/diag-lab/postmortem.md` загружен с хоста командой `wget`: VirtualBox не набирает кириллицу. Текст postmortem составлен по числам кадров 08–09.
- Скрипты `diag-lab-setup.sh` и `diag-lab-check.sh` скопированы в `~/Downloads` из каталога `materials` урока.

Номера PID, время ответа и нагрузка в вашей системе будут другими.

## Кадры и выполненные команды

### 01-load.png

Число ядер, нагрузка до и после запуска двух процессов yes, память.

```bash
nproc
uptime
yes > /dev/null & yes > /dev/null &
sleep 60; uptime
cat /proc/loadavg
free -h
kill %1 %2
```

### 02-top.png

Шапка top и самые загруженные процессы.

```bash
yes > /dev/null &
top -b -n 1 | head -12
```

### 03-htop.png

Полосы загрузки ядер и памяти, таблица процессов htop.

```bash
htop
```

### 04-find.png

Самый загруженный процесс, его предки, каталог и время запуска.

```bash
bash -c 'cd /tmp; while true; do :; done' &
ps -eo pid,ppid,user,stat,%cpu,etime,cmd --sort=-%cpu | head -4
P=$(pgrep -f 'while true')
pstree -s -p $P
ls -l /proc/$P/cwd
ps -o lstart,etime -p $P
kill $P
```

### 05-nice.png

Доли ядра у процессов с nice 0 и 10, отказ и разрешение renice.

```bash
taskset -c 0 yes > /dev/null &
taskset -c 0 nice -n 10 yes > /dev/null &
sleep 10; ps -o pid,ni,psr,%cpu,cmd -C yes
renice -n 19 -p $!
renice -n 5 -p $!
sudo renice -n 5 -p $!
kill %1 %2
```

### 06-time.png

Время sleep, расчёта на Python и обхода /usr; пиковая память программы.

```bash
time sleep 2
time python3 -c "sum(range(30_000_000))"
time find /usr > /dev/null
/usr/bin/time -f "%e s, %M KB" python3 -c "b = bytearray(300_000_000)"
```

### 07-memory.png

Память до запуска, во время работы и после завершения процесса python3.

```bash
free -h
python3 -c "import time; b = bytearray(1_500_000_000); time.sleep(600)" &
sleep 3; free -h
ps -eo pid,user,stat,%mem,rss,cmd --sort=-rss | head -4
kill $!; sleep 1; free -h
```

### 08-lab-find.png

Нагрузка, время ответа сайта, самые загруженные процессы и дерево сервера.

```bash
bash ~/Downloads/diag-lab-setup.sh
python3 ~/diag-lab/bin/incident.py &
sleep 10; uptime
tail -3 ~/diag-lab/web.log
ps -eo pid,ppid,ni,stat,%cpu,cmd --sort=-%cpu | head -6
pstree -p $(pgrep -f incident.py)
```

### 09-lab-fix.png

renice, завершение построителя и расчётов, принудительное завершение агента, журнал диспетчера.

```bash
renice -n 19 -p $(pgrep -f report-calc)
sleep 5; tail -3 ~/diag-lab/web.log
kill $(pgrep -f report-builder); sleep 1; pgrep -af report
kill $(pgrep -f report-calc); sleep 3; tail -2 ~/diag-lab/web.log
S=$(cat ~/diag-lab/sync.lock); kill $S; sleep 2; ps -o pid,stat,cmd -p $S
kill -9 $S; rm ~/diag-lab/sync.lock
cat ~/diag-lab/exit-codes.log
```

### 10-lab-check.png

Postmortem эталонного решения и результат проверки.

```bash
cat ~/diag-lab/postmortem.md
bash ~/Downloads/diag-lab-check.sh
```
