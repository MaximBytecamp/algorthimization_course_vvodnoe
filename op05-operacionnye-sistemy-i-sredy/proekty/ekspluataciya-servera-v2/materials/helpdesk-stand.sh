#!/bin/bash
# Копия сервера helpdesk-01 «Пятого склада» перед выкладкой helpdesk 2.4.1.
# Запуск: sudo bash helpdesk-stand.sh. Повторный запуск возвращает сервер в исходное состояние.
set -u
[ "$(id -u)" = 0 ] || { echo "Run with sudo: sudo bash $0"; exit 1; }
ADMIN=${SUDO_USER:-ubuntu}
AHOME=$(getent passwd "$ADMIN" | cut -d: -f6)
command -v curl >/dev/null || { apt-get update -qq && apt-get install -y -qq curl >/dev/null; }

# прежнее состояние сервера
systemctl disable --now helpdesk.service >/dev/null 2>&1
rm -rf /etc/systemd/system/helpdesk.service /etc/systemd/system/helpdesk.service.d
systemctl daemon-reload
pkill -KILL -f 'helpdesk-api' 2>/dev/null; pkill -KILL -u helpdesk 2>/dev/null; sleep 1
for u in ivanov petrova smirnova helpdesk; do id "$u" >/dev/null 2>&1 && userdel -r "$u" >/dev/null 2>&1; done
for g in helpdesk-dev helpdesk-support helpdesk; do getent group "$g" >/dev/null && groupdel "$g"; done
rm -rf /etc/helpdesk /var/lib/helpdesk /var/log/helpdesk /srv/helpdesk /usr/local/bin/helpdesk-* /etc/sudoers.d/helpdesk* \
       /etc/logrotate.d/helpdesk /tmp/helpdesk-release-* "$AHOME/helpdesk-2.3"
crontab -u "$ADMIN" -l 2>/dev/null | grep -v helpdesk | crontab -u "$ADMIN" - 2>/dev/null

# релиз 2.4.1, выгруженный сборочным конвейером в /tmp
R=/tmp/helpdesk-release-2.4.1
mkdir -p $R/bin $R/conf $R/static/css $R/data
cat > $R/bin/helpdesk-api <<'X'
#!/usr/bin/env python3
"""helpdesk-api 2.4.1 — HTTP API сервиса заявок отдела поддержки."""
import http.server, json, os, pwd, socketserver, stat, sys, time

VERSION = '2.4.1'
CONF = os.environ.get('HELPDESK_CONF', '/etc/helpdesk/helpdesk.conf')
SECRETS = '/etc/helpdesk/secrets.env'


def log(level, msg):
    print(f'{time.strftime("%F %T")} level={level} {msg}', file=sys.stderr, flush=True)


def fail(msg, code):
    log('error', msg); sys.exit(code)


def load_conf(path):
    conf = {}
    try:
        with open(path) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    k, v = line.split('=', 1); conf[k.strip()] = v.strip()
    except OSError as e:
        fail(f'cannot read {path}: {e.strerror}', 2)
    return conf


if os.geteuid() == 0:
    fail('refusing to run as root, use a service account', 1)
conf = load_conf(CONF)
PORT = int(conf.get('PORT', 8080))
DATA = conf.get('DATA_DIR', '/var/lib/helpdesk')
STATIC = conf.get('STATIC_ROOT', '/srv/helpdesk/static')
ACCESS_LOG = conf.get('ACCESS_LOG', '/var/log/helpdesk/access.log')
for key in ('SMTP_TOKEN', 'JWT_SECRET'):
    if not os.environ.get(key):
        fail(f'{key} is not set: secrets are passed to the service through the environment', 3)
try:
    mode = stat.S_IMODE(os.stat(SECRETS).st_mode)
    if mode & 0o077:
        fail(f'{SECRETS} is accessible to group or other users (mode {mode:o}), refusing to start', 3)
except PermissionError:
    pass
except FileNotFoundError:
    fail(f'{SECRETS} not found', 3)
DB = os.path.join(DATA, 'tickets.json')
try:
    with open(DB) as f: tickets = json.load(f)
except (OSError, ValueError) as e:
    fail(f'cannot load {DB}: {e}', 5)
if not os.access(DATA, os.W_OK):
    fail(f'data directory {DATA} is not writable for {pwd.getpwuid(os.geteuid()).pw_name}', 5)
try:
    access = open(ACCESS_LOG, 'a', buffering=1)
except OSError as e:
    fail(f'cannot open {ACCESS_LOG}: {e.strerror}', 5)


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=STATIC, **kw)

    def log_message(self, fmt, *args):
        access.write(f'{time.strftime("%F %T")} {self.client_address[0]} "{self.requestline}" {args[1] if len(args) > 1 else "-"}\n')

    def send_json(self, code, obj):
        body = json.dumps(obj, ensure_ascii=False).encode()
        self.send_response(code); self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body))); self.end_headers(); self.wfile.write(body)

    def do_GET(self):
        if self.path == '/api/health':
            return self.send_json(200, {'status': 'ok', 'version': VERSION, 'tickets': len(tickets), 'user': pwd.getpwuid(os.geteuid()).pw_name})
        if self.path == '/api/tickets':
            return self.send_json(200, tickets)
        return super().do_GET()

    def do_POST(self):
        if self.path != '/api/tickets':
            return self.send_json(404, {'error': 'not found'})
        try:
            data = json.loads(self.rfile.read(int(self.headers.get('Content-Length', 0))) or b'{}')
            title = str(data['title'])[:200]
        except (ValueError, KeyError):
            return self.send_json(400, {'error': 'expected JSON with "title"'})
        t = {'id': max([x['id'] for x in tickets] or [0]) + 1, 'title': title, 'status': 'new', 'created': time.strftime('%F %T')}
        tickets.append(t)
        tmp = DB + '.tmp'
        with open(tmp, 'w') as f: json.dump(tickets, f, ensure_ascii=False, indent=1)
        os.replace(tmp, DB)
        self.send_json(201, t)


class Server(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True


try:
    srv = Server(('127.0.0.1', PORT), Handler)
except OSError as e:
    fail(f'bind 127.0.0.1:{PORT}: {e.strerror}', 4)
mask = os.umask(0); os.umask(mask)
log('info', f'helpdesk-api {VERSION} listening on 127.0.0.1:{PORT}, {len(tickets)} tickets, umask {mask:04o}')
srv.serve_forever()
X
cat > $R/conf/helpdesk.conf <<'X'
# helpdesk 2.4.1
PORT=8080
DATA_DIR=/var/lib/helpdesk
STATIC_ROOT=/srv/helpdesk/static
ACCESS_LOG=/var/log/helpdesk/access.log
X
cat > $R/conf/secrets.env <<'X'
SMTP_TOKEN=smtp_live_4f1c9a0e7b
JWT_SECRET=b8e1f0c4a7d29e6f
X
cat > $R/static/index.html <<'X'
<!doctype html><meta charset="utf-8"><title>Пятый склад · заявки</title><link rel="stylesheet" href="css/app.css">
<h1>Заявки отдела поддержки</h1><p>helpdesk 2.4.1</p>
X
echo 'body{font-family:sans-serif;margin:40px}' > $R/static/css/app.css
cat > $R/data/tickets.json <<'X'
[
 {"id": 1, "title": "Не приходит СМС о доставке", "status": "open", "created": "2026-10-01 09:14:00"},
 {"id": 2, "title": "Курьер не отметил возврат", "status": "new", "created": "2026-10-03 16:40:00"}
]
X
chmod 755 $R/bin/*; chmod 644 $R/conf/* $R/data/*; chown -R "$ADMIN:$ADMIN" $R

# версия 2.3: запущена предыдущим инженером из домашнего каталога и прописана в его crontab
O="$AHOME/helpdesk-2.3"
mkdir -p "$O/bin" "$O/conf"
cat > "$O/bin/helpdesk-api" <<'X'
#!/usr/bin/env python3
# helpdesk-api 2.3.0
import http.server, json
class H(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        b = json.dumps({'status': 'ok', 'version': '2.3.0'}).encode()
        self.send_response(200); self.send_header('Content-Type', 'application/json'); self.end_headers(); self.wfile.write(b)
    def log_message(self, *a): pass
http.server.HTTPServer(('127.0.0.1', 8080), H).serve_forever()
X
printf 'SMTP_TOKEN=smtp_live_4f1c9a0e7b\nJWT_SECRET=b8e1f0c4a7d29e6f\n' > "$O/conf/secrets.env"
chmod 755 "$O/bin/helpdesk-api"; chmod 644 "$O/conf/secrets.env"; chown -R "$ADMIN:$ADMIN" "$O"
( crontab -u "$ADMIN" -l 2>/dev/null; echo "@reboot $O/bin/helpdesk-api >/dev/null 2>&1" ) | crontab -u "$ADMIN" -
sudo -u "$ADMIN" setsid "$O/bin/helpdesk-api" > /dev/null 2>&1 < /dev/null &
sleep 1
echo "helpdesk-01: release 2.4.1 in $R; version 2.3 answers on 127.0.0.1:8080"
