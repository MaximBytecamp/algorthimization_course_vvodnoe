#!/bin/bash
# Приёмочная проверка ТЗ № 1. Запуск: sudo bash helpdesk-acceptance.sh. Ничего не изменяет.
[ "$(id -u)" = 0 ] || { echo "Run with sudo: sudo bash $0"; exit 1; }
ok=0; total=0
t() { local name="$1"; shift; total=$((total + 1))
  if "$@" >/dev/null 2>&1; then ok=$((ok + 1)); printf "  OK    %s\n" "$name"; else printf "  FAIL  %s\n" "$name"; fi; }
no() { ! "$@"; }
as() { local u=$1; shift; sudo -u "$u" "$@"; }
deny() { id "$1" >/dev/null 2>&1 && ! as "$@"; }  # пользователь существует, и действие ему запрещено
in_group() { id -nG "$1" 2>/dev/null | tr ' ' '\n' | grep -qx "$2"; }
system_account() { local uid; uid=$(id -u helpdesk) && [ "$uid" -lt 1000 ] && getent passwd helpdesk | grep -qE ':(/usr/sbin/nologin|/sbin/nologin|/bin/false)$'; }
running_as_helpdesk() { local p; p=$(cat /run/helpdesk/api.pid) && [ "$(ps -o user= -p "$p")" = helpdesk ] && ps -o cmd= -p "$p" | grep -q /usr/local/bin/helpdesk-api; }
dev_sudo_ok() { as ivanov sudo -n -u helpdesk /usr/local/bin/helpdesk-ctl status; }
dev_sudo_narrow() { id ivanov && ! as ivanov sudo -n -u helpdesk /bin/bash -c true && ! as ivanov sudo -n true; }
sudoers_ok() { local f n=0; for f in $(grep -l helpdesk /etc/sudoers.d/* 2>/dev/null); do
  visudo -cf "$f" && [ "$(stat -c %a "$f")" = 440 ] || return 1; n=$((n + 1)); done; [ $n -gt 0 ]; }
service_umask() { local m; m=$(awk '/^Umask/ {print $2}' /proc/"$(cat /run/helpdesk/api.pid)"/status) && [ $(( 8#$m & 8#027 )) -eq $(( 8#027 )) ]; }
static_shared() { local f=/srv/helpdesk/static/.acceptance-$$; as petrova touch "$f" && [ "$(stat -c %G "$f")" = helpdesk-dev ] && as ivanov rm "$f"; }

echo "Accounts"
t "helpdesk: system account without login shell"         system_account
t "ivanov and petrova are in helpdesk-dev"                eval 'in_group ivanov helpdesk-dev && in_group petrova helpdesk-dev'
t "smirnova is in helpdesk-support, not in helpdesk-dev"  eval 'in_group smirnova helpdesk-support && ! in_group smirnova helpdesk-dev'
t "nobody of the team has sudo group"                     eval '! in_group ivanov sudo && ! in_group petrova sudo && ! in_group smirnova sudo'
echo "Layout"
t "programs in /usr/local/bin"                            test -x /usr/local/bin/helpdesk-api -a -x /usr/local/bin/helpdesk-ctl
t "configuration in /etc/helpdesk"                        test -f /etc/helpdesk/helpdesk.conf -a -f /etc/helpdesk/secrets.env
t "database in /var/lib/helpdesk"                         test -f /var/lib/helpdesk/tickets.db
t "static files in /srv/helpdesk/static"                  test -f /srv/helpdesk/static/index.html -a -f /srv/helpdesk/static/css/app.css
t "release copy removed from /tmp"                        no test -e /tmp/helpdesk-release-2.4.1
echo "Access"
t "developers read helpdesk.conf"                         as petrova cat /etc/helpdesk/helpdesk.conf
t "developers cannot read secrets.env"                    deny ivanov cat /etc/helpdesk/secrets.env
t "support cannot read secrets.env"                       deny smirnova cat /etc/helpdesk/secrets.env
t "support reads api.log"                                 as smirnova tail -1 /var/log/helpdesk/api.log
t "developers read api.log"                            as ivanov tail -1 /var/log/helpdesk/api.log
t "support cannot change api.log"                         deny smirnova sh -c 'echo x >> /var/log/helpdesk/api.log'
t "other users cannot read logs and configuration"        eval '! sudo -u nobody cat /var/log/helpdesk/api.log && ! sudo -u nobody cat /etc/helpdesk/helpdesk.conf'
t "only helpdesk enters /var/lib/helpdesk"                eval 'deny ivanov ls /var/lib/helpdesk && as helpdesk ls /var/lib/helpdesk'
t "developers publish static files, group is kept"        static_shared
t "helpdesk reads static files"                           as helpdesk cat /srv/helpdesk/static/index.html
echo "Service"
t "version 2.3 is stopped"                                no pgrep -f 'helpdesk-2.3/bin/helpdesk-api'
t "helpdesk-api 2.4.1 runs as helpdesk"                   running_as_helpdesk
t "service umask closes group write and other users"     service_umask
t "developers run helpdesk-ctl as helpdesk without password" dev_sudo_ok
t "developers cannot run other commands as helpdesk or root" dev_sudo_narrow
t "sudoers rules for helpdesk are valid, mode 440"       sudoers_ok
echo "Result: $ok of $total"
