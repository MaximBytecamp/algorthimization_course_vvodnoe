# Матрица доступа · helpdesk-01

## Фактические права

| Ресурс | `stat -c "%A %U:%G"` |
|---|---|
| `/etc/helpdesk/helpdesk.conf` | |
| `/etc/helpdesk/secrets.env` | |
| `/var/lib/helpdesk` | |
| `/var/log/helpdesk` и `api.log` | |
| `/srv/helpdesk/static` | |

## Проверка от имени каждой роли

| Ресурс | Роль | Команда проверки | Ожидали | Получили |
|---|---|---|---|---|
| | | | | |

## Правило sudo

```
содержимое файла из /etc/sudoers.d
```

Вывод `sudo -l -U ivanov`:

```
```
