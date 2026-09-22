# Пользователи, группы и sudo · отчёт

ФИО: …
Группа: …
Дата: …
Среда: установленная Ubuntu / Live (указать)

## Учётная запись

Команды:

```bash
id, getent passwd $(whoami)
```

![Учётная запись](screenshots/01-id.png)

Результат: …

Подпишите семь полей своей строки /etc/passwd.

Вывод: …

## passwd и shadow

Команды:

```bash
ls -l /etc/passwd /etc/shadow
```

![passwd и shadow](screenshots/02-shadow.png)

Результат: …

Почему shadow закрыт для остальных пользователей.

Вывод: …

## Группы

Команды:

```bash
groups, getent group sudo
```

![Группы](screenshots/03-groups.png)

Результат: …

Где основная группа, где дополнительные.

Вывод: …

## Правила sudo

Команды:

```bash
sudo -l
```

![Правила sudo](screenshots/04-sudo.png)

Результат: …

Какое правило даёт вам права администратора.

Вывод: …

## Команда mobile-app

Команды:

```bash
getent group …, id lead dev qa guest
```

![Команда mobile-app](screenshots/05-team.png)

Результат: …

Совпадают ли группы со схемой ролей.

Вывод: …

## Каталоги проекта

Команды:

```bash
ls -l /srv/mobile
```

![Каталоги проекта](screenshots/06-dirs.png)

Результат: …

Что означает каждая цифра в 2770.

Вывод: …

## Тесты доступа

Команды:

```bash
sudo -u … ls / touch
```

![Тесты доступа](screenshots/07-access.png)

Результат: …

Результаты таблицы тестов доступа.

Вывод: …

## Проверка

Команды:

```bash
sudo bash team-lab-check.sh
```

![Проверка](screenshots/08-check.png)

Результат: …

Итог проверки; какие пункты потребовали исправления.

Вывод: …

## Отказ sudo в журнале

Команды:

```bash
journalctl -t sudo | grep "NOT in sudoers"
```

![Отказ sudo в журнале](screenshots/09-denied.png)

Результат: …

Кто, когда и какую команду пытался выполнить.

Вывод: …

## Почему постоянная работа под root опасна

1. …
2. …
3. …

## Перед сдачей

- [ ] Проверка: 21 из 21.
- [ ] access-tests.md заполнен.
- [ ] Учебные учётные записи удалены.
