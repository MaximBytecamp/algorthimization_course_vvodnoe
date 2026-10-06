#!/bin/bash
# Приёмка закрытия доступа kozlov на ops-03. Запуск: sudo bash offboarding-acceptance.sh. Сервер не изменяет.
[ "$(id -u)" = 0 ] || { echo "Run with sudo: sudo bash $0"; exit 1; }
ok=0; total=0
t() { local name="$1"; shift; total=$((total + 1))
  if "$@" >/dev/null 2>&1; then ok=$((ok + 1)); printf "  OK    %s\n" "$name"; else printf "  FAIL  %s\n" "$name"; fi; }
B=/var/backups/offboarding/kozlov
locked() { passwd -S kozlov | awk '{exit $2 != "L"}'; }
expired() { local e; e=$(getent shadow kozlov | cut -d: -f8); [ -n "$e" ] && [ "$e" -le $(( $(date +%s) / 86400 )) ]; }
nologin() { getent passwd kozlov | grep -qE ':(/usr/sbin/nologin|/sbin/nologin|/bin/false)$'; }
no_sudo() { ! grep -rqs kozlov /etc/sudoers /etc/sudoers.d && ! sudo -l -U kozlov | grep -q 'may run'; }
unit_off() { ! systemctl is-active home-share.service && ! systemctl is-enabled home-share.service; }
no_cron() { ! crontab -u kozlov -l && ! grep -rqs kozlov /etc/crontab /etc/cron.d; }
no_port() { ! ss -ltn | awk '{print $4}' | grep -qE ':8000$'; }
root_keys() { ! grep -qs 'kozlov@' /root/.ssh/authorized_keys; }
no_files() { [ -z "$(find / -xdev -user kozlov -not -path '/home/kozlov*' -not -path "$B*" 2>/dev/null)" ]; }
no_new_setuid() { [ -z "$(find / -xdev -perm -4000 -type f 2>/dev/null | sort | comm -13 /root/.ops03-setuid.list -)" ]; }
backup_ok() { [ "$(stat -c '%U %a' $B)" = "root 700" ] && [ -f $B/notes.txt ] && [ -f $B/.ssh/authorized_keys ] && [ -f $B/db_dump_2026-09-28.sql ] && ls $B | grep -q cron && ls $B | grep -q home-share; }
orlova_owns() { [ -z "$(find /srv/devops ! -user orlova)" ] && [ -z "$(find /srv/devops ! -group devops)" ]; }
no_leaked() { [ -z "$(find /home/kozlov/share -type f 2>/dev/null)" ]; }

echo "Account"
t "kozlov: password locked"                           locked
t "kozlov: account expired"                           expired
t "kozlov: no login shell"                            nologin
t "kozlov: no supplementary groups"                   eval '[ "$(id -Gn kozlov)" = kozlov ]'
t "kozlov: no sudo rules"                             no_sudo
t "kozlov: account and home directory kept"           test -d /home/kozlov
echo "Access paths"
t "no processes of kozlov"                            eval '! pgrep -u kozlov'
t "home-share.service stopped and disabled"           unit_off
t "nothing listens on port 8000"                      no_port
t "no scheduled jobs of kozlov"                       no_cron
t "kozlov key removed from root authorized_keys"      root_keys
t "no setuid programs added after the stand"          no_new_setuid
echo "Files"
t "/srv/devops belongs to orlova:devops"              orlova_owns
t "orlova runs deploy.sh"                             sudo -u orlova /srv/devops/deploy/deploy.sh 2.4
t "deploy key: owner only"                            eval '[ "$(stat -c "%U %a" /srv/devops/keys/prod_deploy_key)" = "orlova 600" ]'
t "lebedeva still works in /srv/finance"              sudo -u lebedeva cat /srv/finance/payments-2026-09.csv
t "no files of kozlov outside home and backup"        no_files
t "database dump removed from /srv/share"             eval '[ -z "$(find /srv/share -name "db_dump*")" ]'
t "copied company documents removed from ~/share"     no_leaked
t "backup: root only; notes, ssh, dump, cron, unit"   backup_ok
echo "Result: $ok of $total"
