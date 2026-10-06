# Происхождение снимков

Все PNG — реальные кадры дисплея виртуальной машины, без генерации или перерисовки терминала.

- Дата: 6 октября 2026 года по времени виртуальной машины (UTC).
- VM: Ubuntu-lab-01, VirtualBox 7.2 на macOS ARM64.
- Ubuntu Desktop 24.04.4 LTS ARM64, Live-сеанс с установочного ISO, загружен заново перед съёмкой.
- Пользователь: ubuntu (UID 1000, пароль не задан, правило sudo NOPASSWD Live-сеанса); оболочка Bash; локаль C.UTF-8; маска 0002.
- Экран: 1280 × 800; окно GNOME Terminal развёрнуто; окно установщика закрыто.
- Снимки: `VBoxManage controlvm Ubuntu-lab-01 screenshotpng`.
- Ввод команд: `VBoxManage controlvm … keyboardputstring` построчно с паузой; перед каждым кадром — Ctrl+L и `clear`.
- Скрипты `perms-lab-setup.sh` и `perms-lab-check.sh` скопированы в `~/Downloads` из каталога `materials` урока.
- ACL в `/srv` на корне Live-сеанса (overlay) не поддерживается, поэтому опыт с ACL снят в `/tmp` (tmpfs).

Номера UID и GID, время и размеры в вашей системе будут другими.

## Кадры и выполненные команды

### 01-ls-l.png

```bash
bash ~/Downloads/perms-lab-setup.sh
cd ~/perm-lab
ls -l
stat -c '%A %a %U %G %n' report.txt docs /etc/shadow
ls -ld /tmp ~
```

### 02-file-rwx.png

```bash
chmod u-r report.txt
cat report.txt
chmod u+r report.txt
./backup.sh
bash backup.sh
chmod u+x backup.sh
./backup.sh
ls -l report.txt backup.sh
```

### 03-dir-rx.png

```bash
chmod u-x docs
ls docs
cat docs/notes.txt
cd docs
chmod u+x docs
chmod u-r docs
ls docs
cat docs/notes.txt
chmod u+r docs
ls -ld docs
```

### 04-dir-w.png

```bash
chmod u-w docs
touch docs/new.txt
rm docs/notes.txt
chmod u+w docs
chmod a-w report.txt
ls -l report.txt
rm report.txt
# ввод: n
ls -l report.txt
chmod u+w report.txt
```

### 05-chmod-sym.png

```bash
chmod -v go-r db.env
chmod -v u=rwx,g=rx,o= backup.sh
chmod -v g+w report.txt
chmod -v a+r docs/notes.txt
ls -l
```

### 06-chmod-num.png

```bash
chmod -v 640 report.txt
chmod -v 700 private
chmod -v 755 backup.sh
chmod -v 600 db.env
stat -c '%a %A %n' report.txt private backup.sh db.env
```

### 07-chown.png

```bash
chown anna report.txt
sudo chown anna report.txt
sudo chown anna:devteam db.env
ls -l report.txt db.env
chgrp devteam backup.sh
chgrp adm backup.sh
ls -l backup.sh
sudo chown -R ubuntu:ubuntu ~/perm-lab
ls -l
```

### 08-umask.png

```bash
umask
touch new-file.txt
mkdir new-dir
ls -ld new-file.txt new-dir
(umask 077; touch secret.txt; mkdir secret-dir; ls -ld secret.txt secret-dir)
(umask 027; touch team.txt; ls -l team.txt)
umask
```

### 09-setuid.png

```bash
ls -l /usr/bin/passwd /etc/shadow
stat -c '%a %A %n' /usr/bin/passwd /usr/bin/sudo /tmp
find /usr/bin -perm -4000 | head -6
```

### 10-sticky.png

```bash
sudo mkdir /srv/shared
sudo chgrp devteam /srv/shared
sudo chmod 3770 /srv/shared
ls -ld /srv/shared
sudo -u anna touch /srv/shared/anna.txt
sudo -u boris touch /srv/shared/boris.txt
sudo ls -l /srv/shared
sudo -u boris rm /srv/shared/anna.txt
sudo -u anna rm /srv/shared/anna.txt
sudo ls /srv/shared
```

### 11-acl.png

```bash
mkdir /tmp/acl-demo
chmod 700 /tmp/acl-demo
sudo -u anna ls /tmp/acl-demo
setfacl -m u:anna:rx /tmp/acl-demo
ls -ld /tmp/acl-demo
getfacl /tmp/acl-demo
sudo -u anna ls /tmp/acl-demo
sudo -u boris ls /tmp/acl-demo
setfacl -b /tmp/acl-demo
ls -ld /tmp/acl-demo
```

### 12-shop-dirs.png

```bash
sudo groupadd shop-dev
for u in alex bella chris; do sudo useradd -m -s /bin/bash $u; done
sudo usermod -aG shop-dev alex
sudo usermod -aG shop-dev bella
sudo mkdir -p /srv/shop/{src,releases,uploads}
sudo chgrp shop-dev /srv/shop/{src,releases,uploads}
sudo chmod 2770 /srv/shop/src
sudo chmod 2775 /srv/shop/releases
sudo chmod 3770 /srv/shop/uploads
ls -l /srv/shop
id alex; id bella; id chris
```

### 13-shop-access.png

```bash
sudo -u alex bash -c 'echo "print(1)" > /srv/shop/src/app.py'
echo 'print(2)' | sudo -u bella tee -a /srv/shop/src/app.py
sudo -u alex bash -c 'echo TOKEN=lab > /srv/shop/src/config.env; chmod 600 /srv/shop/src/config.env'
sudo -u bella cat /srv/shop/src/config.env
sudo -u alex bash -c 'echo release-1 > /srv/shop/releases/v1.txt'
sudo chown bella /srv/shop/releases/v1.txt
sudo -u chris cat /srv/shop/releases/v1.txt
sudo -u chris ls /srv/shop/src
sudo -u bella touch /srv/shop/uploads/photo.jpg
sudo -u alex rm /srv/shop/uploads/photo.jpg
sudo ls -l /srv/shop/src /srv/shop/releases
```

### 14-shop-check.png

```bash
sudo bash ~/Downloads/perms-lab-check.sh
```
