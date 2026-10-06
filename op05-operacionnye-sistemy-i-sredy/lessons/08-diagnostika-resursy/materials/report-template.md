# Диагностика процессов и управление ресурсами · отчёт

ФИО: …
Группа: …
Дата: …
Среда: установленная Ubuntu / Live (указать)

## Нагрузка

Команды:

```bash
nproc, uptime, /proc/loadavg, free -h
```

![Нагрузка](screenshots/01-load.png)

Результат: …

Сравните load average с числом ядер до и после запуска yes.

Вывод: …

## top

Команды:

```bash
top -b -n 1 | head -12
```

![top](screenshots/02-top.png)

Результат: …

Подпишите нагрузку, долю us и самый загруженный процесс.

Вывод: …

## htop

Команды:

```bash
htop
```

![htop](screenshots/03-htop.png)

Результат: …

Что показывают полосы ядер и памяти.

Вывод: …

## Поиск виновника

Команды:

```bash
ps --sort=-%cpu, pstree -s -p, /proc/PID/cwd
```

![Поиск виновника](screenshots/04-find.png)

Результат: …

PID виновника, кто его запустил и где он работает.

Вывод: …

## nice и renice

Команды:

```bash
taskset, nice, renice
```

![nice и renice](screenshots/05-nice.png)

Результат: …

Почему ядро разделилось 90 на 10 и почему renice отказал.

Вывод: …

## time

Команды:

```bash
time, /usr/bin/time -f
```

![time](screenshots/06-time.png)

Результат: …

Соотношение real, user и sys для каждой команды.

Вывод: …

## Память

Команды:

```bash
free -h, ps --sort=-rss
```

![Память](screenshots/07-memory.png)

Результат: …

Сколько памяти занял процесс и вернулась ли она.

Вывод: …

## Инцидент: симптом

Команды:

```bash
uptime, tail web.log, ps, pstree
```

![Инцидент: симптом](screenshots/08-lab-find.png)

Результат: …

Симптом в числах и виновники.

Вывод: …

## Инцидент: исправление

Команды:

```bash
renice, kill, kill -9, exit-codes.log
```

![Инцидент: исправление](screenshots/09-lab-fix.png)

Результат: …

Что сделано и как изменилось время ответа.

Вывод: …

## Проверка

Команды:

```bash
bash diag-lab-check.sh
```

![Проверка](screenshots/10-lab-check.png)

Результат: …

Итог проверки; какие пункты потребовали исправления.

Вывод: …

## Перед сдачей

- [ ] Проверка: 11 из 11.
- [ ] Под каждым снимком есть вывод.
- [ ] postmortem.md заполнен.
