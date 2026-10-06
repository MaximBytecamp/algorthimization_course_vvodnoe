#!/bin/bash
# Стенд к ТЗ № 1: сервер helpdesk-01 перед выкладкой версии 2.4.1.
# Запуск: sudo bash helpdesk-stand.sh. Повторный запуск возвращает сервер в исходное состояние.
set -u
[ "$(id -u)" = 0 ] || { echo "Run with sudo: sudo bash $0"; exit 1; }
ADMIN=${SUDO_USER:-ubuntu}
AHOME=$(getent passwd "$ADMIN" | cut -d: -f6)

# прежнее состояние
pkill -KILL -f 'helpdesk-api' 2>/dev/null; pkill -KILL -u helpdesk 2>/dev/null; sleep 1
for u in ivanov petrova smirnova helpdesk; do id "$u" >/dev/null 2>&1 && userdel -r "$u" >/dev/null 2>&1; done
for g in helpdesk-dev helpdesk-support helpdesk; do getent group "$g" >/dev/null && groupdel "$g"; done
rm -rf /etc/helpdesk /var/lib/helpdesk /var/log/helpdesk /srv/helpdesk /run/helpdesk /usr/local/bin/helpdesk-* \
       /etc/sudoers.d/helpdesk* /tmp/helpdesk-release-* "$AHOME/helpdesk-2.3"

# релиз 2.4.1, выгруженный сборкой в /tmp
R=/tmp/helpdesk-release-2.4.1
mkdir -p $R/bin $R/conf $R/static/css $R/data
cat > $R/bin/helpdesk-api <<'X'
#!/bin/bash
# helpdesk-api 2.4.1 — HTTP API сервиса заявок
CONF=/etc/helpdesk/helpdesk.conf
SECRETS=/etc/helpdesk/secrets.env
die() { echo "$(date '+%F %T') level=error $1" >&2; exit "${2:-1}"; }
[ "$(id -un)" = helpdesk ] || die "must run as user helpdesk, not $(id -un)"
[ -r "$CONF" ] || die "cannot read $CONF" 2
[ -r "$SECRETS" ] || die "cannot read $SECRETS" 2
case $(stat -c %a "$SECRETS") in *[1-7]) die "$SECRETS is accessible by other users ($(stat -c %a "$SECRETS")), refusing to start" 3;; esac
. "$CONF"
umask "${UMASK:-0002}"
for p in $(pgrep -f 'bin/helpdesk-api'); do
  [ "$p" != $$ ] && die "bind 0.0.0.0:8080: address already in use (pid $p)" 4
done
touch /var/log/helpdesk/api.log 2>/dev/null || die "cannot write /var/log/helpdesk/api.log" 5
[ -w /var/lib/helpdesk ] || die "cannot write /var/lib/helpdesk" 5
echo $$ > /run/helpdesk/api.pid 2>/dev/null || die "cannot write /run/helpdesk/api.pid" 5
echo "$(date '+%F %T') level=info helpdesk-api 2.4.1 started pid=$$ port=${PORT:-8080} db=/var/lib/helpdesk/tickets.db" >> /var/log/helpdesk/api.log
trap 'echo "$(date "+%F %T") level=info stopped" >> /var/log/helpdesk/api.log; rm -f /run/helpdesk/api.pid; exit 0' TERM
while true; do
  touch /var/lib/helpdesk/tickets.db
  echo "$(date '+%F %T') level=info GET /api/tickets 200" >> /var/log/helpdesk/api.log
  sleep 5 & wait $!
done
X
cat > $R/bin/helpdesk-ctl <<'X'
#!/bin/bash
# helpdesk-ctl start|stop|status — управление helpdesk-api
API=/usr/local/bin/helpdesk-api
PIDF=/run/helpdesk/api.pid
case "${1:-}" in
  start)
    . /etc/helpdesk/helpdesk.conf 2>/dev/null
    umask "${UMASK:-0002}"
    setsid "$API" >> /var/log/helpdesk/api.log 2>&1 < /dev/null &
    sleep 1
    if [ -s "$PIDF" ] && kill -0 "$(cat "$PIDF")" 2>/dev/null; then echo "helpdesk-api started, pid $(cat "$PIDF")"
    else echo "helpdesk-api failed to start:"; tail -1 /var/log/helpdesk/api.log 2>/dev/null; exit 1; fi ;;
  stop)
    [ -s "$PIDF" ] && kill "$(cat "$PIDF")" && echo "helpdesk-api stopped" || { echo "helpdesk-api is not running"; exit 1; } ;;
  status)
    if [ -s "$PIDF" ] && kill -0 "$(cat "$PIDF")" 2>/dev/null; then ps -o pid,user,etime,cmd -p "$(cat "$PIDF")"
    else echo "helpdesk-api is not running"; exit 3; fi ;;
  *) echo "usage: helpdesk-ctl start|stop|status"; exit 2 ;;
esac
X
cat > $R/conf/helpdesk.conf <<'X'
# helpdesk 2.4.1
PORT=8080
WORKERS=4
DB_PATH=/var/lib/helpdesk/tickets.db
STATIC_ROOT=/srv/helpdesk/static
LOG_FILE=/var/log/helpdesk/api.log
# маска прав для файлов, которые создаёт служба
UMASK=0002
X
cat > $R/conf/secrets.env <<'X'
DB_PASSWORD=Hd-7q2!vX9m
SMTP_TOKEN=smtp_live_4f1c9a0e7b
JWT_SECRET=b8e1f0c4a7d29e6f
X
echo '<!doctype html><title>Helpdesk</title><link rel="stylesheet" href="css/app.css"><h1>Helpdesk 2.4.1</h1>' > $R/static/index.html
echo 'body{font-family:sans-serif}' > $R/static/css/app.css
echo 'tickets-schema-v24' > $R/data/tickets.db
chmod 755 $R/bin/*; chmod 644 $R/conf/* ; chown -R "$ADMIN:$ADMIN" $R

# версия 2.3, которую предыдущий инженер запустил из своего домашнего каталога
O="$AHOME/helpdesk-2.3"
mkdir -p "$O/bin"
cat > "$O/bin/helpdesk-api" <<'X'
#!/bin/bash
# helpdesk-api 2.3.0
while true; do sleep 5; done
X
chmod 755 "$O/bin/helpdesk-api"; chown -R "$ADMIN:$ADMIN" "$O"
sudo -u "$ADMIN" setsid "$O/bin/helpdesk-api" > /dev/null 2>&1 < /dev/null &

echo "helpdesk-01: release 2.4.1 is in $R, version 2.3 is running from $O"
