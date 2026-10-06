#!/bin/bash
# Приёмочная проверка ТЗ № 2. Запуск: sudo bash billing-acceptance.sh. Ничего не изменяет.
[ "$(id -u)" = 0 ] || { echo "Run with sudo: sudo bash $0"; exit 1; }
ok=0; total=0
t() { local name="$1"; shift; total=$((total + 1))
  if "$@" >/dev/null 2>&1; then ok=$((ok + 1)); printf "  OK    %s\n" "$name"; else printf "  FAIL  %s\n" "$name"; fi; }
L=/var/log/billing; C=/etc/billing/billing.conf; E=/var/lib/billing/exports/export-2026-09.csv
conf() { grep -E "^$1=" $C | tail -1 | cut -d= -f2; }
usage_ok() { [ "$(df --output=pcent $L | tail -1 | tr -dc 0-9)" -le 50 ]; }
no_old() { mountpoint -q $L && [ -z "$(find $L -type f -mtime +7)" ]; }
no_core() { [ -z "$(find $L -name 'core*')" ]; }
export_ok() { [ "$(sha256sum < $E | cut -d' ' -f1)" = "$(cat /root/.billing-export.sha256)" ] && [ "$(stat -c %U $E)" = billing ]; }
no_log_exports() { [ -z "$(find $L -name 'export-*')" ]; }
conf_closed() { [ "$(stat -c '%U %G' $C)" = "root billing" ] && case $(stat -c %a $C) in *0) true;; *) false;; esac && ! sudo -u nobody cat $C; }
api_pid() { pgrep -u billing -f '^/bin/bash /usr/local/bin/billing-api' | head -1; }
api_info() { local p; p=$(api_pid) && grep -q "pid=$p level=info started" $L/api.log; }
no_debug_after() { awk '/level=info started/ {bad=0; seen=1} /level=debug/ {bad=1} END {exit !(seen && !bad)}' $L/api.log; }

echo "Disk"
t "log partition is used at most 50 %"                 usage_ok
t "no logs older than 7 days on the partition"         no_old
t "core dump removed"                                  no_core
t "export moved to /var/lib/billing/exports intact"    export_ok
t "no exports left in /var/log/billing"                no_log_exports
echo "Configuration"
t "EXPORT_DIR=/var/lib/billing/exports"                eval '[ "$(conf EXPORT_DIR)" = /var/lib/billing/exports ]'
t "LOG_LEVEL is not debug"                             eval '[ -n "$(conf LOG_LEVEL)" ] && [ "$(conf LOG_LEVEL)" != debug ]'
t "billing.conf: root:billing, closed for others"      conf_closed
echo "Processes"
t "billingd supervisor is running"                     pgrep -u billing -f billingd.py
t "billing-api runs and started with level=info"       api_info
t "no debug lines after the restart"                  no_debug_after
t "billing-report and its workers are stopped"         eval '! pgrep -f billing-report'
echo "Result: $ok of $total"
