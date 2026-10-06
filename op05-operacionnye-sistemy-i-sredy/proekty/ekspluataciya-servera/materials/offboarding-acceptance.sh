#!/bin/bash
# Приёмочная проверка ТЗ № 3. Запуск: sudo bash offboarding-acceptance.sh. Ничего не изменяет.
[ "$(id -u)" = 0 ] || { echo "Run with sudo: sudo bash $0"; exit 1; }
ok=0; total=0
t() { local name="$1"; shift; total=$((total + 1))
  if "$@" >/dev/null 2>&1; then ok=$((ok + 1)); printf "  OK    %s\n" "$name"; else printf "  FAIL  %s\n" "$name"; fi; }
B=/var/backups/offboarding/kozlov
locked() { passwd -S kozlov | awk '{exit $2 != "L"}'; }
expired() { local e; e=$(getent shadow kozlov | cut -d: -f8); [ -n "$e" ] && [ "$e" -le $(( $(date +%s) / 86400 )) ]; }
nologin() { getent passwd kozlov | grep -qE ':(/usr/sbin/nologin|/sbin/nologin|/bin/false)$'; }
no_groups() { [ "$(id -Gn kozlov)" = kozlov ]; }
no_sudo() { ! grep -rqs kozlov /etc/sudoers /etc/sudoers.d && ! sudo -l -U kozlov | grep -q 'may run'; }
no_files() { [ -z "$(find / -xdev -user kozlov -not -path '/home/kozlov*' -not -path "$B*" 2>/dev/null)" ]; }
no_new_setuid() { [ -z "$(find / -xdev -perm -4000 -type f 2>/dev/null | sort | comm -13 /root/.ops03-setuid.list -)" ] && [ ! -e /var/tmp/.cache-k/kbash ]; }
backup_ok() { [ "$(stat -c '%U %a' $B)" = "root 700" ] && [ -f $B/notes.txt ] && [ -f $B/.ssh/authorized_keys ] && [ -f $B/db_dump_2026-09-28.sql ]; }
orlova_owns() { [ -z "$(find /srv/devops ! -user orlova)" ] && [ -z "$(find /srv/devops ! -group devops)" ]; }

echo "Account"
t "kozlov: password locked"                         locked
t "kozlov: account expired"                         expired
t "kozlov: no login shell"                          nologin
t "kozlov: not in devops, finance, sudo"            no_groups
t "kozlov: no sudo rules"                           no_sudo
t "kozlov: no running processes"                    eval '! pgrep -u kozlov'
t "kozlov: home directory kept"                     test -d /home/kozlov
echo "Files"
t "/srv/devops belongs to orlova:devops"            orlova_owns
t "orlova runs deploy.sh"                           sudo -u orlova /srv/devops/deploy/deploy.sh 2.4
t "orlova reads prod_deploy_key"                    sudo -u orlova cat /srv/devops/keys/prod_deploy_key
t "deploy key closed for group and others"         eval '[ "$(stat -c %a /srv/devops/keys/prod_deploy_key)" = 600 ]'
t "lebedeva still works in /srv/finance"            sudo -u lebedeva cat /srv/finance/payments-2026-09.csv
t "no files of kozlov outside home and backup"      no_files
t "database dump removed from /srv/share"           eval '[ -z "$(find /srv/share -name "db_dump*")" ]'
t "backup: root only, notes, keys and dump inside"  backup_ok
t "home of kozlov has no notes and ssh keys"        eval '[ ! -e /home/kozlov/notes.txt ] && [ ! -e /home/kozlov/.ssh/authorized_keys ]'
echo "System"
t "no setuid files added after the stand"           no_new_setuid
echo "Result: $ok of $total"
