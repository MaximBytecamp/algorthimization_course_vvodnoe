#!/bin/bash
# Приёмка работ по инциденту на billing-02. Запуск: sudo bash billing-acceptance.sh. Сервер не изменяет.
[ "$(id -u)" = 0 ] || { echo "Run with sudo: sudo bash $0"; exit 1; }
ok=0; total=0
t() { local name="$1"; shift; total=$((total + 1))
  if "$@" >/dev/null 2>&1; then ok=$((ok + 1)); printf "  OK    %s\n" "$name"; else printf "  FAIL  %s\n" "$name"; fi; }
L=/var/log/billing; C=/etc/billing/billing.conf; E=/var/lib/billing/exports/export-2026-09.csv
conf() { grep -E "^$1=" $C | tail -1 | cut -d= -f2; }
rp() { systemctl show billing-report.service -p "$1" --value; }
usage_ok() { mountpoint -q $L && [ "$(df --output=pcent $L | tail -1 | tr -dc 0-9)" -le 50 ]; }
export_ok() { [ "$(sha256sum < $E | cut -d' ' -f1)" = "$(cat /root/.billing-export.sha256)" ] && [ "$(stat -c %U $E)" = billing ]; }
conf_closed() { [ "$(stat -c '%U %G' $C)" = "root billing" ] && case $(stat -c %a $C) in *0) true;; *) false;; esac && sudo -u billing cat $C && ! sudo -u nobody cat $C; }
api_info() { curl -fsS --max-time 3 http://127.0.0.1:8081/api/health | grep -q '"log_level": "info"'; }
limited() { [ "$(rp TimeoutStartUSec)" != infinity ] || [ "$(rp RuntimeMaxUSec)" != infinity ]; }
nice_ok() { [ "$(rp Nice)" -ge 10 ]; }
rotate_ok() { [ -f /etc/logrotate.d/billing ] && logrotate -d /etc/logrotate.d/billing 2>&1 | grep -q 'api.log' && ! logrotate -d /etc/logrotate.d/billing 2>&1 | grep -qiE 'error|insecure' && grep -qE '^\s*rotate\s+7\b' /etc/logrotate.d/billing; }

echo "Disk"
t "log partition is used at most 50 %"                  usage_ok
t "no logs older than 7 days"                           eval '[ -z "$(find $L -type f -mtime +7)" ]'
t "no core dumps"                                       eval '[ -z "$(find $L -name "core*")" ]'
t "export is in /var/lib/billing/exports, intact"       export_ok
t "no exports left in /var/log/billing"                 eval '[ -z "$(find $L -name "export-*")" ]'
echo "Configuration"
t "EXPORT_DIR=/var/lib/billing/exports"                 eval '[ "$(conf EXPORT_DIR)" = /var/lib/billing/exports ]'
t "billing.conf: root:billing, readable by the service, closed for others" conf_closed
echo "Services"
t "billing-api is active"                               systemctl is-active billing-api.service
t "billing-api runs without debug logging"              api_info
t "billing-report is not running"                       eval '! systemctl is-active billing-report.service && ! pgrep -u billing -f billing-report'
t "nightly timer is still enabled"                      systemctl is-enabled billing-report.timer
t "billing-report runs with lowered priority"           nice_ok
t "billing-report is limited in time"                   limited
echo "Prevention"
t "logrotate keeps billing logs 7 days, config valid"   rotate_ok
echo "Result: $ok of $total"
