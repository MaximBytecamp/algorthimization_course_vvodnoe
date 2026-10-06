# Практическая работа · каталог проекта shop

Роли: alex и bella — разработчики (группа shop-dev), chris — аналитик (только личная группа).
Каталоги: /srv/shop/src — 2770, /srv/shop/releases — 2775, /srv/shop/uploads — 3770; группа всех трёх — shop-dev.

| № | Задание | Подсказка |
|---|---|---|
| 1 | Создайте группу `shop-dev` и учётные записи `alex`, `bella`, `chris` с домашними каталогами и оболочкой bash. Добавьте alex и bella в `shop-dev`. | `groupadd`, `useradd -m -s`, `usermod -aG` |
| 2 | Создайте каталоги `/srv/shop/src`, `/srv/shop/releases`, `/srv/shop/uploads` и назначьте им группу `shop-dev`. | `mkdir -p` и фигурные скобки, `chgrp` |
| 3 | Установите права по таблице: src — `2770`, releases — `2775`, uploads — `3770`. Проверьте строки `ls -l`. | `chmod`; перед заданием переведите числа в буквы сами |
| 4 | От имени alex создайте `src/app.py` с одной строкой, от имени bella допишите в него вторую строку. | `sudo -u alex bash -c '…'`, `tee -a` |
| 5 | От имени alex создайте `src/config.env` и закройте его правами `600`. Убедитесь, что bella его не читает. | `chmod 600` внутри `bash -c` |
| 6 | От имени alex опубликуйте `releases/v1.txt` и передайте файл во владение bella. | `sudo chown` |
| 7 | Проверьте доступ chris: читает `releases/v1.txt`, не открывает `src`, не создаёт файлы в `releases`. | `sudo -u chris` |
| 8 | От имени bella положите файл в `uploads` и убедитесь, что alex не может его удалить. | sticky-бит |
| 9 | Запустите проверку `sudo bash ~/Downloads/perms-lab-check.sh` и добейтесь результата 14 из 14. | скрипт в материалах занятия |

Проверка: `sudo bash ~/Downloads/perms-lab-check.sh`

## Оценка · 10 баллов

- 2 — опыты с правами файла и каталога: r, w, x и удаление — части 1–2
- 2 — chmod буквами и числом, перевод своих примеров — часть 3
- 2 — chown и chgrp, umask с расчётом по тройкам — части 4–5
- 2 — каталоги проекта с setgid и sticky — задания 1–3
- 2 — тесты доступа и проверка 14 из 14 — задания 4–9

## Уборка

```bash
sudo rm -r /srv/shop /srv/shared   # после проверки содержимого
for u in alex bella chris; do sudo userdel -r $u; done
sudo groupdel shop-dev
```

## Домашнее задание

Таблица прав своего проекта permissions.md: шесть объектов, права буквами и числом, umask команды, где нужен sticky-бит или ACL.
Сдача: папка lesson_04 в своём репозитории по шаблону https://github.com/MaximBytecamp/os-environments-template, ветка hw-04, Pull Request в main, до начала следующего занятия.
