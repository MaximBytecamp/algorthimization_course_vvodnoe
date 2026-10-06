#!/bin/bash
# Копия сервера billing-02 «Пятого склада» в момент ночного инцидента.
# Запуск: sudo bash billing-stand.sh. Повторный запуск возвращает сервер в исходное состояние.
# Журналы billing на этом сервере — отдельный раздел; в копии он подключён из файла-образа, после перезагрузки копию разворачивают заново.
set -u
[ "$(id -u)" = 0 ] || { echo "Run with sudo: sudo bash $0"; exit 1; }
command -v curl >/dev/null || { apt-get update -qq && apt-get install -y -qq curl >/dev/null; }

for u in billing-report.timer billing-report.service billing-api.service; do systemctl disable --now "$u" >/dev/null 2>&1; done
rm -rf /etc/systemd/system/billing-* /etc/systemd/system/billing-*.d
systemctl daemon-reload; systemctl reset-failed >/dev/null 2>&1
pkill -KILL -u billing 2>/dev/null; sleep 1
mountpoint -q /var/log/billing && umount /var/log/billing
id billing >/dev/null 2>&1 && userdel billing
getent group billing >/dev/null && groupdel billing
rm -rf /etc/billing /var/lib/billing /var/log/billing /var/lib/billing-logs.img /usr/local/bin/billing-* /etc/logrotate.d/billing /root/.billing-export.sha256

useradd -r -U -s /usr/sbin/nologin -d /var/lib/billing -M billing
install -d -o billing -g billing -m 750 /var/lib/billing
mkdir -p /etc/billing

# раздел журналов
truncate -s 200M /var/lib/billing-logs.img
mkfs.ext4 -q -F -m 0 /var/lib/billing-logs.img
mkdir -p /var/log/billing
mount -o loop /var/lib/billing-logs.img /var/log/billing
rm -rf /var/log/billing/lost+found

cat > /etc/billing/billing.conf <<'X'
# billing 3.8 · billing-02
LOG_LEVEL=debug
LOG_FILE=/var/log/billing/api.log
EXPORT_DIR=/var/log/billing/exports
LISTEN=127.0.0.1:8081
DB_PASSWORD=Bl-55t!kq2Zr
REPORT_WORKERS=auto
X
chmod 666 /etc/billing/billing.conf

cat > /usr/local/bin/billing-api <<'X'
#!/usr/bin/env python3
"""billing-api 3.8 — приём платежей. Настройки: /etc/billing/billing.conf."""
import http.server, json, os, socketserver, sys, threading, time

def conf():
    c = {}
    with open('/etc/billing/billing.conf') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                k, v = line.split('=', 1); c[k] = v
    return c

try:
    C = conf()
except OSError as e:
    print(f'cannot read /etc/billing/billing.conf: {e.strerror}', file=sys.stderr); sys.exit(2)
LEVEL = C.get('LOG_LEVEL', 'info')
LOG = open(C.get('LOG_FILE', '/var/log/billing/api.log'), 'a', buffering=1)
host, port = C.get('LISTEN', '127.0.0.1:8081').split(':')
payments = 0

def log(level, msg):
    if level == 'debug' and LEVEL != 'debug':
        return
    try:
        LOG.write(f'{time.strftime("%F %T")} level={level} {msg}\n')
    except OSError as e:
        print(f'cannot write log: {e.strerror}', file=sys.stderr)

def poller():
    n = 0
    while True:
        n += 1
        log('debug', f'queue poll #{n}: backend=10.20.0.15 pool=8/8 idle, pending=0, retry_queue=0, last_payment_id={payments}, '
                     'headers={"X-Gateway":"pay-gw-2","X-Trace":"' + format(n * 2654435761 % 2**32, '08x') + '"}')
        time.sleep(0.02)

class H(http.server.BaseHTTPRequestHandler):
    def log_message(self, *a):
        pass
    def reply(self, code, obj):
        b = json.dumps(obj).encode()
        self.send_response(code); self.send_header('Content-Type', 'application/json'); self.end_headers(); self.wfile.write(b)
    def do_GET(self):
        if self.path == '/api/health':
            return self.reply(200, {'status': 'ok', 'version': '3.8', 'log_level': LEVEL, 'payments': payments})
        self.reply(404, {'error': 'not found'})
    def do_POST(self):
        global payments
        if self.path != '/api/payments':
            return self.reply(404, {'error': 'not found'})
        payments += 1
        log('info', f'payment accepted id={payments}')
        self.reply(201, {'id': payments, 'status': 'accepted'})

class S(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True

srv = S((host, int(port)), H)
log('info', f'billing-api 3.8 started pid={os.getpid()} level={LEVEL} listen={host}:{port}')
threading.Thread(target=poller, daemon=True).start()
srv.serve_forever()
X
cat > /usr/local/bin/billing-report <<'X'
#!/usr/bin/env python3
"""billing-report 3.8 — ночная сверка платежей с выгрузками для бухгалтерии."""
import csv, glob, multiprocessing, os, sys, time

def conf():
    c = {}
    for line in open('/etc/billing/billing.conf'):
        line = line.strip()
        if line and not line.startswith('#') and '=' in line:
            k, v = line.split('=', 1); c[k] = v
    return c

def reconcile(chunk):
    total = 0
    for row in chunk:
        amount = row[2]
        # сумма в копейках: отбрасываем разделитель до тех пор, пока не получится целое число
        while not amount.isdigit():
            amount = amount.replace('.', '', 1) if '.' in amount else amount
        total += int(amount)
    return total

if __name__ == '__main__':
    C = conf()
    files = sorted(glob.glob(os.path.join(C.get('EXPORT_DIR', '/var/lib/billing/exports'), 'export-*.csv')))
    rows = [r for f in files for r in list(csv.reader(open(f), delimiter=';'))[1:]]
    n = os.cpu_count() * 2
    print(f'billing-report: {len(rows)} rows from {len(files)} files, {n} workers', flush=True)
    chunks = [rows[i::n] for i in range(n)]
    with multiprocessing.Pool(n) as pool:
        total = sum(pool.map(reconcile, chunks))
    print(f'billing-report: total {total / 100:.2f}', flush=True)
X
chmod 755 /usr/local/bin/billing-api /usr/local/bin/billing-report

cat > /etc/systemd/system/billing-api.service <<'X'
[Unit]
Description=billing-api: приём платежей
After=network.target

[Service]
User=billing
Group=billing
ExecStart=/usr/local/bin/billing-api
Restart=always
RestartSec=2

[Install]
WantedBy=multi-user.target
X
cat > /etc/systemd/system/billing-report.service <<'X'
[Unit]
Description=billing-report: ночная сверка платежей

[Service]
Type=oneshot
User=billing
Group=billing
ExecStart=/usr/local/bin/billing-report
X
cat > /etc/systemd/system/billing-report.timer <<'X'
[Unit]
Description=Ночная сверка платежей в 01:00

[Timer]
OnCalendar=*-*-* 01:00:00
Persistent=true

[Install]
WantedBy=timers.target
X

# что накопилось на разделе
L=/var/log/billing
line='2026-09-01 03:12:44 level=debug queue poll #104772: backend=10.20.0.15 pool=8/8 idle, pending=0, retry_queue=0'
for d in $(seq 8 22); do f=$L/api.log-$(date -d "-$d day" +%Y%m%d); yes "$line" | head -c 7M > "$f"; touch -d "-$d day" "$f"; done
for d in 1 2 3; do f=$L/api.log-$(date -d "-$d day" +%Y%m%d); yes "$line" | head -c 1M > "$f"; touch -d "-$d day" "$f"; done
head -c 40M /dev/urandom > $L/core.billing-api.4711; touch -d '-2 day' $L/core.billing-api.4711
mkdir -p $L/exports
{ echo 'payment_id;date;amount;status'; for i in $(seq 1 300000); do echo "$i;2026-09-$(( i % 28 + 1 ));$(( i * 37 % 100000 )).00;paid"; done
  for i in $(seq 300001 300064); do echo "$i;2026-09-30;1 250,00;paid"; done; } > $L/exports/export-2026-09.csv
touch -d '-12 day' $L/exports/export-2026-09.csv
sha256sum $L/exports/export-2026-09.csv | cut -d' ' -f1 > /root/.billing-export.sha256
chown -R billing:billing $L; chmod 755 $L

systemctl daemon-reload
systemctl enable --now billing-api.service billing-report.timer >/dev/null 2>&1
systemctl start --no-block billing-report.service
sleep 3
df -h $L | tail -1
