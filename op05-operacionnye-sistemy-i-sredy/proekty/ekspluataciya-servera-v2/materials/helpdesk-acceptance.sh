#!/bin/bash
# Приёмка выкладки helpdesk 2.4.1 на helpdesk-01. Запуск: sudo bash helpdesk-acceptance.sh. Сервер не изменяет.
[ "$(id -u)" = 0 ] || { echo "Run with sudo: sudo bash $0"; exit 1; }
ADMIN=${SUDO_USER:-ubuntu}
ok=0; total=0
t() { local name="$1"; shift; total=$((total + 1))
  if "$@" >/dev/null 2>&1; then ok=$((ok + 1)); printf "  OK    %s\n" "$name"; else printf "  FAIL  %s\n" "$name"; fi; }
as() { local u=$1; shift; sudo -u "$u" "$@"; }
deny() { id "$1" >/dev/null 2>&1 && ! as "$@"; }
in_group() { id -nG "$1" 2>/dev/null | tr ' ' '\n' | grep -qx "$2"; }
prop() { systemctl show helpdesk.service -p "$1" --value; }
system_account() { [ "$(id -u helpdesk)" -lt 1000 ] && getent passwd helpdesk | grep -qE ':(/usr/sbin/nologin|/sbin/nologin|/bin/false)$'; }
health() { curl -fsS --max-time 3 http://127.0.0.1:8080/api/health | grep -q '"version": "2.4.1"'; }
umask_ok() { local m; m=$(prop UMask) && [ $(( 8#$m & 8#027 )) -eq $(( 8#027 )) ]; }
static_shared() { local f=/srv/helpdesk/static/.acceptance-$$; as petrova touch "$f" && [ "$(stat -c %G "$f")" = helpdesk-dev ] && as ivanov rm "$f"; }
dev_can() { as ivanov sudo -n -l "$@"; }
dev_narrow() { id ivanov && ! dev_can /usr/bin/systemctl restart ssh && ! dev_can /usr/bin/systemctl stop cron && ! dev_can /bin/bash && ! dev_can /usr/bin/su; }
sudoers_ok() { local f n=0; for f in $(grep -l helpdesk /etc/sudoers.d/* 2>/dev/null); do
  visudo -cf "$f" && [ "$(stat -c %a "$f")" = 440 ] || return 1; n=$((n + 1)); done; [ $n -gt 0 ]; }
no_old_cron() { ! { for u in $(cut -d: -f1 /etc/passwd); do crontab -u "$u" -l 2>/dev/null; done; cat /etc/crontab /etc/cron.d/* 2>/dev/null; } | grep -q 'helpdesk-2.3'; }
rotate_ok() { [ -f /etc/logrotate.d/helpdesk ] && logrotate -d /etc/logrotate.d/helpdesk 2>&1 | grep -q 'access.log' && ! logrotate -d /etc/logrotate.d/helpdesk 2>&1 | grep -qiE 'error|insecure'; }
rotate_policy() { grep -qE '^\s*rotate\s+7\b' /etc/logrotate.d/helpdesk && grep -qE '^\s*daily\b' /etc/logrotate.d/helpdesk; }

echo "Accounts"
t "helpdesk: system account without login shell"        system_account
t "ivanov and petrova are in helpdesk-dev"               eval 'in_group ivanov helpdesk-dev && in_group petrova helpdesk-dev'
t "smirnova is in helpdesk-support, not in helpdesk-dev" eval 'in_group smirnova helpdesk-support && ! in_group smirnova helpdesk-dev'
t "nobody of the team is in the sudo group"              eval '! in_group ivanov sudo && ! in_group petrova sudo && ! in_group smirnova sudo'
echo "Layout"
t "helpdesk-api in /usr/local/bin"                       test -x /usr/local/bin/helpdesk-api
t "configuration in /etc/helpdesk"                       test -f /etc/helpdesk/helpdesk.conf -a -f /etc/helpdesk/secrets.env
t "tickets in /var/lib/helpdesk"                         test -f /var/lib/helpdesk/tickets.json
t "static files in /srv/helpdesk/static"                 test -f /srv/helpdesk/static/index.html -a -f /srv/helpdesk/static/css/app.css
t "release copy removed from /tmp"                       eval '! test -e /tmp/helpdesk-release-2.4.1'
echo "Access"
t "developers read helpdesk.conf"                        as petrova cat /etc/helpdesk/helpdesk.conf
t "only root reads secrets.env"                          eval 'deny helpdesk cat /etc/helpdesk/secrets.env && deny ivanov cat /etc/helpdesk/secrets.env'
t "support and developers read access.log"               eval 'as smirnova tail -1 /var/log/helpdesk/access.log && as ivanov tail -1 /var/log/helpdesk/access.log'
t "support cannot change access.log"                     deny smirnova sh -c 'echo x >> /var/log/helpdesk/access.log'
t "other users read neither logs nor configuration"      eval '! sudo -u nobody cat /var/log/helpdesk/access.log && ! sudo -u nobody cat /etc/helpdesk/helpdesk.conf'
t "only helpdesk enters /var/lib/helpdesk"               eval 'deny ivanov ls /var/lib/helpdesk && as helpdesk ls /var/lib/helpdesk'
t "developers publish static files, group is kept"       static_shared
echo "Service"
t "version 2.3 is stopped"                               eval '! pgrep -f helpdesk-2.3/bin'
t "version 2.3 does not start after reboot"              no_old_cron
t "helpdesk.service is enabled and active"               eval 'systemctl is-enabled helpdesk.service && systemctl is-active helpdesk.service'
t "service runs as helpdesk"                             eval '[ "$(prop User)" = helpdesk ] && [ "$(ps -o user= -p "$(prop MainPID)")" = helpdesk ]'
t "service umask closes group write and others"          umask_ok
t "service restarts after a crash"                       eval 'case "$(prop Restart)" in on-failure|always|on-abnormal) true;; *) false;; esac'
t "API answers: version 2.4.1"                           health
echo "Operations"
t "developers restart and view the service via sudo"     eval 'dev_can /usr/bin/systemctl restart helpdesk && dev_can /usr/bin/systemctl status helpdesk && dev_can /usr/bin/journalctl -u helpdesk'
t "developers have no other sudo rights"                 dev_narrow
t "sudoers rules for helpdesk are valid, mode 440"       sudoers_ok
t "logrotate config for helpdesk logs is valid"          rotate_ok
t "logs are rotated daily and kept 7 days"               rotate_policy
echo "Result: $ok of $total"
