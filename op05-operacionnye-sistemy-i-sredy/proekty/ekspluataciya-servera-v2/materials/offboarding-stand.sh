#!/bin/bash
# Копия сервера ops-03 «Пятого склада» в последний рабочий день администратора kozlov.
# Запуск: sudo bash offboarding-stand.sh. Повторный запуск возвращает сервер в исходное состояние.
set -u
[ "$(id -u)" = 0 ] || { echo "Run with sudo: sudo bash $0"; exit 1; }

systemctl disable --now home-share.service >/dev/null 2>&1
rm -f /etc/systemd/system/home-share.service; systemctl daemon-reload; systemctl reset-failed >/dev/null 2>&1
for u in kozlov orlova lebedeva; do crontab -u "$u" -r 2>/dev/null; pkill -KILL -u "$u" 2>/dev/null; done; sleep 1
for u in kozlov orlova lebedeva; do id "$u" >/dev/null 2>&1 && userdel -r "$u" >/dev/null 2>&1; done
for g in devops finance; do getent group "$g" >/dev/null && groupdel "$g"; done
rm -rf /srv/devops /srv/finance /srv/share /var/backups/offboarding /var/tmp/.cache-k /etc/sudoers.d/90-kozlov /root/.ops03-*
[ -f /root/.ssh/authorized_keys ] && sed -i '/kozlov@/d' /root/.ssh/authorized_keys

groupadd devops; groupadd finance
useradd -m -s /bin/bash -c "Kozlov Dmitry, DevOps" -G devops,finance,sudo kozlov
useradd -m -s /bin/bash -c "Orlova Anna, DevOps" -G devops orlova
useradd -m -s /bin/bash -c "Lebedeva Irina, accountant" -G finance lebedeva
echo 'kozlov:Spring2026!' | chpasswd; echo 'orlova:Ops-2026-a' | chpasswd; echo 'lebedeva:Fin-2026-l' | chpasswd
echo 'kozlov ALL=(ALL) NOPASSWD: ALL' > /etc/sudoers.d/90-kozlov; chmod 440 /etc/sudoers.d/90-kozlov

mkdir -p /srv/devops/deploy /srv/devops/keys /srv/finance /srv/share
cat > /srv/devops/deploy/deploy.sh <<'X'
#!/bin/bash
# выкладка сервиса shop на продуктовые серверы: ./deploy.sh <версия>
set -e
hosts=$(grep -c ansible_host /srv/devops/deploy/inventory.ini)
echo "deploy shop ${1:?version} to $hosts hosts with key /srv/devops/keys/prod_deploy_key"
X
printf 'shop-web-01 ansible_host=10.20.1.11\nshop-web-02 ansible_host=10.20.1.12\nshop-db-01 ansible_host=10.20.1.21\n' > /srv/devops/deploy/inventory.ini
printf -- '-----BEGIN OPENSSH PRIVATE KEY-----\nb3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW\n-----END OPENSSH PRIVATE KEY-----\n' > /srv/devops/keys/prod_deploy_key
chown -R kozlov:devops /srv/devops; chmod 2770 /srv/devops /srv/devops/deploy /srv/devops/keys
chmod 750 /srv/devops/deploy/deploy.sh; chmod 640 /srv/devops/deploy/inventory.ini; chmod 600 /srv/devops/keys/prod_deploy_key
printf 'date;contractor;amount\n2026-09-30;Stroymontazh LLC;1250000.00\n2026-10-02;Sever-Trans LLC;84300.00\n' > /srv/finance/payments-2026-09.csv
chown -R lebedeva:finance /srv/finance; chmod 2770 /srv/finance; chmod 660 /srv/finance/payments-2026-09.csv
chmod 1777 /srv/share
{ echo '-- PostgreSQL database dump, shop, 2026-09-28'; echo 'COPY customers (id, name, phone, email) FROM stdin;'
  for i in $(seq 1 500); do echo "$i	Customer $i	+7900$(printf %07d $((i * 7919 % 10000000)))	user$i@example.com"; done; } > /srv/share/db_dump_2026-09-28.sql
chown kozlov:kozlov /srv/share/db_dump_2026-09-28.sql; chmod 644 /srv/share/db_dump_2026-09-28.sql

H=/home/kozlov
mkdir -p $H/.ssh $H/share $H/.local/bin
KEY='ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIK0zl0vQb8Xw2k4yR7pN3dL5sT9uV1cE6fG2hJ8kM0aZ kozlov@home-laptop'
echo "$KEY" > $H/.ssh/authorized_keys
printf 'grafana admin: admin / Gr4f-2026\nyandex cloud token: y0_AgAAAABkF3x\nvpn: kozlov / Vpn#2026\n' > $H/notes.txt
cat > $H/.local/bin/collect.sh <<'X'
#!/bin/bash
# забирает свежие документы в общую папку, чтобы смотреть из дома
cp -u /srv/finance/*.csv /home/kozlov/share/ 2>/dev/null
cp -u /srv/devops/deploy/inventory.ini /home/kozlov/share/ 2>/dev/null
X
chmod 755 $H/.local/bin/collect.sh; chmod 700 $H/.ssh; chmod 600 $H/.ssh/authorized_keys $H/notes.txt
chown -R kozlov:kozlov $H
echo '*/5 * * * * /home/kozlov/.local/bin/collect.sh' | crontab -u kozlov -
sudo -u kozlov /home/kozlov/.local/bin/collect.sh

mkdir -p /root/.ssh; chmod 700 /root/.ssh; echo "$KEY" >> /root/.ssh/authorized_keys; chmod 600 /root/.ssh/authorized_keys

cat > /etc/systemd/system/home-share.service <<'X'
[Unit]
Description=Home share for remote access
After=network.target

[Service]
User=kozlov
WorkingDirectory=/home/kozlov/share
ExecStart=/usr/bin/python3 -m http.server 8000 --bind 0.0.0.0
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
X

# список программ с setuid до kozlov
find / -xdev -perm -4000 -type f 2>/dev/null | sort > /root/.ops03-setuid.list; chmod 600 /root/.ops03-setuid.list
mkdir -p /var/tmp/.cache-k && cp /bin/bash /var/tmp/.cache-k/kbash && chmod 4755 /var/tmp/.cache-k/kbash && chown -R root:root /var/tmp/.cache-k

systemctl daemon-reload; systemctl enable --now home-share.service >/dev/null 2>&1
sleep 1
echo "ops-03: kozlov has $(pgrep -u kozlov | wc -l) processes"
