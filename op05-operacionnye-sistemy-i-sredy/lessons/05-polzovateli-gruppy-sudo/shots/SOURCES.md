# Происхождение снимков

Все PNG — реальные кадры дисплея виртуальной машины, без генерации или перерисовки терминала.

- Дата: 21 сентября 2026 года, 21:46–21:58 по времени виртуальной машины (UTC).
- VM: Ubuntu-lab-01, VirtualBox 7.2 на macOS ARM64.
- Ubuntu Desktop 24.04.4 LTS ARM64, Live-сеанс с установочного ISO.
- Пользователь: ubuntu (UID 1000, пароль не задан, правило sudo NOPASSWD Live-сеанса); оболочка Bash; локаль C.UTF-8.
- Экран: 1280 × 800; окно GNOME Terminal развёрнуто.
- Снимки: `VBoxManage controlvm Ubuntu-lab-01 screenshotpng`.
- Ввод команд: `VBoxManage controlvm … keyboardputstring` построчно с паузой; перед каждым кадром выполнялась команда `clear`.
- Пароль учебных учётных записей anna, boris, viktor: `Lab-2026-pass`; при вводе на экране не отображается.
- Учётная запись installer (UID 1001) и файлы sudoers.d/casper, 90-cloud-init-users созданы Live-сеансом.
- Скрипт `team-lab-check.sh` скопирован в `~/Downloads` из каталога `materials` урока.

## Кадры и выполненные команды

### 01-whoami.png

Подготовка (не снималась):

```bash
cd ~
```

```bash
whoami
id
id root
getent passwd ubuntu root
wc -l /etc/passwd
cut -d: -f1,3,7 /etc/passwd | head -8
```

### 02-system-users.png

```bash
grep bash /etc/passwd
grep -c nologin /etc/passwd
getent passwd www-data
ps -eo user= | sort | uniq -c
```

### 03-shadow.png

```bash
ls -l /etc/passwd /etc/shadow
cat /etc/shadow
sudo grep ubuntu /etc/shadow
sudo grep www-data /etc/shadow
sudo passwd -S ubuntu
```

### 04-groups.png

```bash
groups
id -Gn
getent group sudo adm
grep ubuntu /etc/group
ls -l /var/log/syslog
ls -ld /home/ubuntu
```

### 05-root.png

```bash
sudo whoami
sudo id
ls /root
sudo ls -a /root
sudo -l
```

### 06-sudoers.png

```bash
ls -l /etc/sudoers
sudo grep -v "^#" /etc/sudoers | grep -v "^$"
sudo ls /etc/sudoers.d
```

### 07-sudo-log.png

```bash
journalctl _COMM=sudo -n 6 --no-pager
```

### 08-sudo-i.png

```bash
sudo -i
whoami
pwd
exit
whoami
```

### 09-useradd.png

```bash
sudo groupadd devteam
sudo useradd -m -s /bin/bash -c "Anna Developer" anna
getent passwd anna
getent group devteam
sudo ls -la /home/anna
ls -la /etc/skel
```

### 10-adduser.png

```bash
sudo adduser boris
# ввод пароля
# ввод пароля
Boris Developer
# ввод: Enter
# ввод: Enter
# ввод: Enter
# ввод: Enter
y
```

### 11-passwd-usermod.png

```bash
sudo passwd anna
# ввод пароля
# ввод пароля
sudo useradd -m -s /bin/bash -c "Viktor Tester" viktor
sudo passwd viktor
# ввод пароля
# ввод пароля
sudo usermod -aG devteam anna
sudo usermod -aG devteam boris
id anna
id boris
getent group devteam
```

### 12-usermod-trap.png

```bash
sudo groupadd testers
sudo usermod -aG testers viktor
id viktor
sudo usermod -G devteam viktor
id viktor
sudo usermod -G testers viktor
id viktor
```

### 13-etc-after.png

```bash
tail -n 3 /etc/passwd
tail -n 5 /etc/group
sudo tail -n 3 /etc/shadow
ls -l /home
```

### 14-shared-setup.png

```bash
sudo mkdir /srv/devteam
ls -ld /srv/devteam
sudo chgrp devteam /srv/devteam
sudo chmod 2770 /srv/devteam
ls -ld /srv/devteam
```

### 15-access-test.png

```bash
sudo -u anna touch /srv/devteam/plan.txt
echo "draft by boris" | sudo -u boris tee -a /srv/devteam/plan.txt
sudo -u boris ls -l /srv/devteam
sudo -u viktor ls /srv/devteam
ls /srv/devteam
sudo ls -l /srv/devteam
```

### 16-su-viktor.png

```bash
su - viktor
# ввод пароля
whoami
pwd
ls /srv/devteam
sudo whoami
# ввод пароля
exit
whoami
```

### 17-sudo-denied-log.png

```bash
journalctl -t sudo --no-pager | grep "NOT in sudoers"
sudo grep "NOT in sudoers" /var/log/auth.log
journalctl _COMM=su -n 3 --no-pager
```

### 18-cleanup.png

```bash
sudo userdel -r viktor
sudo groupdel testers
id viktor
ls /home
getent group devteam
```

### 19-team-map.png

Подготовка (не снималась):

```bash
sudo groupadd mobile-dev && sudo groupadd mobile-qa && for u in lead dev qa guest; do sudo useradd -m -s /bin/bash $u; done
sudo usermod -aG mobile-dev,mobile-qa,sudo lead && sudo usermod -aG mobile-dev dev && sudo usermod -aG mobile-qa qa
sudo mkdir -p /srv/mobile/src /srv/mobile/reports && sudo chgrp mobile-dev /srv/mobile/src && sudo chgrp mobile-qa /srv/mobile/reports && sudo chmod 2770 /srv/mobile/src /srv/mobile/reports
wget -q -O ~/Downloads/team-lab-check.sh http://10.0.2.2:8767/team-lab-check.sh
```

```bash
getent group mobile-dev mobile-qa sudo
id lead dev qa guest
ls -l /srv/mobile
```

### 20-team-check.png

Подготовка (не снималась):

```bash
wget -q -O ~/Downloads/team-lab-check.sh http://10.0.2.2:8767/team-lab-check.sh
```

```bash
sudo bash ~/Downloads/team-lab-check.sh
```

