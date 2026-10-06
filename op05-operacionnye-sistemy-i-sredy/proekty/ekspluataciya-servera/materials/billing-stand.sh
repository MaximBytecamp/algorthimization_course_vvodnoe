#!/bin/bash
# Стенд к ТЗ № 2: сервер billing-02 в момент инцидента.
# Запуск: sudo bash billing-stand.sh. Повторный запуск возвращает сервер в исходное состояние.
# Раздел журналов — файл-образ, подключённый к /var/log/billing; после перезагрузки стенд запускают заново.
set -u
[ "$(id -u)" = 0 ] || { echo "Run with sudo: sudo bash $0"; exit 1; }

pkill -KILL -u billing 2>/dev/null; sleep 1
mountpoint -q /var/log/billing && umount /var/log/billing
id billing >/dev/null 2>&1 && userdel billing
getent group billing >/dev/null && groupdel billing
rm -rf /etc/billing /var/lib/billing /var/log/billing /var/lib/billing-logs.img /usr/local/bin/billing-* /usr/local/lib/billing /root/.billing-export.sha256

useradd -r -U -s /usr/sbin/nologin -d /var/lib/billing -M billing
mkdir -p /var/lib/billing /usr/local/lib/billing /etc/billing
chown billing:billing /var/lib/billing; chmod 750 /var/lib/billing

# раздел журналов: 200 МБ образа, около 170 МБ места
truncate -s 200M /var/lib/billing-logs.img
mkfs.ext4 -q -F -m 0 /var/lib/billing-logs.img
mkdir -p /var/log/billing
mount -o loop /var/lib/billing-logs.img /var/log/billing
rm -rf /var/log/billing/lost+found

cat > /etc/billing/billing.conf <<'X'
# billing 3.8
LOG_LEVEL=debug
LOG_FILE=/var/log/billing/api.log
EXPORT_DIR=/var/log/billing/exports
DB_HOST=10.20.0.15
DB_USER=billing
DB_PASSWORD=Bl-55t!kq2Zr
REPORT_WORKERS=auto
X
chmod 666 /etc/billing/billing.conf

cat > /usr/local/bin/billing-api <<'X'
#!/bin/bash
# billing-api 3.8 — приём платежей
. /etc/billing/billing.conf || exit 2
LOG=${LOG_FILE:-/var/log/billing/api.log}
echo "$(date '+%F %T') pid=$$ level=$LOG_LEVEL started" >> "$LOG"
trap 'echo "$(date "+%F %T") pid=$$ stopped" >> "$LOG"; exit 0' TERM
n=0
while true; do
  if [ "$LOG_LEVEL" = debug ]; then
    t=$(date '+%F %T')
    for i in $(seq 50); do
      n=$((n + 1)); echo "$t level=debug sql=\"SELECT id, amount, status FROM payments WHERE id=$n\" rows=1 ms=3"
    done >> "$LOG"
    sleep 1 & wait $!
  else
    echo "$(date '+%F %T') level=info POST /api/payments 201" >> "$LOG"
    sleep 5 & wait $!
  fi
done
X
cat > /usr/local/bin/billing-report <<'X'
#!/bin/bash
# billing-report 3.8 — ночной расчёт сверки платежей
if [ "${1:-}" = --worker ]; then
  [ "$2" = 1 ] && trap 'echo "worker 1: TERM ignored, reconciliation in progress" >> /var/lib/billing/report.log' TERM
  while true; do for ((i = 0; i < 200000; i++)); do :; done; done
fi
for n in $(seq $(( $(nproc) * 2 ))); do /usr/local/bin/billing-report --worker $n & done
wait
X
cat > /usr/local/lib/billing/billingd.py <<'X'
#!/usr/bin/env python3
# billingd — супервизор billing: запускает службы и перезапускает billing-api после выхода.
import os, subprocess, time
LOG = '/var/lib/billing/billingd.log'
def log(msg):
    with open(LOG, 'a') as f: f.write(time.strftime('%F %T ') + msg + '\n')
def start(cmd):
    p = subprocess.Popen(cmd); log(f'{cmd[0]} started pid={p.pid}'); return p
api = start(['/usr/local/bin/billing-api'])
start(['/usr/local/bin/billing-report'])
while True:
    pid, st = os.waitpid(-1, 0)
    how = f'signal {os.WTERMSIG(st)}' if os.WIFSIGNALED(st) else f'exit {os.WEXITSTATUS(st)}'
    if pid == api.pid:
        log(f'billing-api pid={pid} {how}, restarting'); time.sleep(2); api = start(['/usr/local/bin/billing-api'])
    else:
        log(f'billing-report pid={pid} {how}')
X
chmod 755 /usr/local/bin/billing-api /usr/local/bin/billing-report /usr/local/lib/billing/billingd.py

# что накопилось на разделе журналов
L=/var/log/billing
line='2026-09-01 03:12:44 level=debug sql="SELECT id, amount, status FROM payments WHERE id=104772" rows=1 ms=3'
for d in $(seq 8 22); do
  f=$L/api-$(date -d "-$d day" +%F).log
  yes "$line" | head -c 7M > "$f"; touch -d "-$d day" "$f"
done
for d in 1 2 3; do
  f=$L/api-$(date -d "-$d day" +%F).log
  yes "$line" | head -c 1M > "$f"; touch -d "-$d day" "$f"
done
head -c 40M /dev/urandom > $L/core.billing-api.4711; touch -d '-2 day' $L/core.billing-api.4711
mkdir -p $L/exports
{ echo 'payment_id;date;amount;status'; for i in $(seq 1 300000); do echo "$i;2026-09-$(( i % 28 + 1 ));$(( i * 37 % 100000 )).00;paid"; done; } > $L/exports/export-2026-09.csv
touch -d '-12 day' $L/exports/export-2026-09.csv
sha256sum $L/exports/export-2026-09.csv | cut -d' ' -f1 > /root/.billing-export.sha256
chown -R billing:billing $L; chmod 755 $L

sudo -u billing setsid python3 /usr/local/lib/billing/billingd.py > /dev/null 2>&1 < /dev/null &
sleep 2
df -h $L | tail -1
