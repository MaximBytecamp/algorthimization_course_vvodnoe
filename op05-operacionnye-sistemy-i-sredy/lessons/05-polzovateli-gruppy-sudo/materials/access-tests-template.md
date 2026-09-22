# Таблица тестов доступа · команда mobile-app

ФИО: …
Группа: …
Дата: …

Графу «Ожидается» заполните до запуска команды. После запуска впишите фактический результат:
`разрешено` или текст ошибки.

| № | Пользователь | Команда | Ожидается | Получено |
|---|---|---|---|---|
| 1 | lead | `sudo -u lead touch /srv/mobile/src/lead.txt` | … | … |
| 2 | lead | `sudo -u lead ls /srv/mobile/reports` | … | … |
| 3 | dev | `sudo -u dev touch /srv/mobile/src/main.kt` | … | … |
| 4 | dev | `sudo -u dev ls /srv/mobile/reports` | … | … |
| 5 | qa | `sudo -u qa touch /srv/mobile/reports/test-1.md` | … | … |
| 6 | qa | `sudo -u qa ls /srv/mobile/src` | … | … |
| 7 | guest | `sudo -u guest ls /srv/mobile/src` | … | … |
| 8 | guest | `sudo -u guest ls /srv/mobile/reports` | … | … |

## Схема ролей

| Роль | Учётная запись | Группы | Каталоги | Может | Не может |
|---|---|---|---|---|---|
| руководитель | lead | mobile-dev, mobile-qa, sudo | src, reports | … | … |
| разработчик | dev | mobile-dev | src | … | … |
| тестировщик | qa | mobile-qa | reports | … | … |
| внешний сотрудник | guest | — | — | … | … |

## Почему постоянная работа под root опасна

Три примера из занятия:

1. …
2. …
3. …
