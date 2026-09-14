# Происхождение скриншотов

Все 23 PNG — реальные кадры дисплея виртуальной машины, без генерации или перерисовки терминала.

- Дата: 14 сентября 2026 года.
- VM: Ubuntu-lab-01, VirtualBox 7.2 на macOS ARM64.
- Ubuntu Desktop 24.04.4 LTS ARM64, Live-сеанс с установочного ISO.
- Пользователь: ubuntu; оболочка Bash; локаль вывода C.
- Экран: 1280 × 800; окно GNOME Terminal развёрнуто.
- Снимки: VBoxManage controlvm Ubuntu-lab-01 screenshotpng.
- Ввод команд: VirtualBox keyboardputfile и нажатие Enter.
- Все созданные файлы: ~/linux-fhs-lab.
- Учебная tmpfs размером 16M отключена в опыте 21.
- Системная конфигурация и виртуальные диски не изменялись.

Live-корень имеет FSTYPE overlay и SOURCE /cow. Установленная ОС может показывать ext4 или другой тип; loop и squashfs связаны с Live-средой и snap.
Имена интерфейсов, PID, inode, объём памяти и место на диске не являются эталонными значениями.

## Кадры и выполненные команды

### 01-root.png

```bash
cd /
pwd
ls -lah /
```

### 02-paths.png

```bash
cd /usr/share
pwd
cd ..
pwd
cd /
cd usr
cd bin
pwd
```

### 03-home.png

```bash
cd ~
echo "$HOME"
pwd
ls
ls -a
getent passwd root
```

### 04-lab.png

```bash
mkdir -p ~/linux-fhs-lab/{config,data,logs,tmp,screenshots}
cd ~/linux-fhs-lab
printf "Linux filesystem\n" > data/info.txt
printf "mode=lab\n" > config/app.conf
find . -maxdepth 2 -type f
```

### 05-fhs.png

```bash
ls -d /boot /etc /home /opt /srv /usr /var /mnt /media
ls -ld /root
ls -la /opt /srv
```

### 06-config.png

```bash
cat /etc/os-release
cat /etc/hostname
cat /etc/hosts
```

### 07-accounts.png

```bash
getent passwd "$(id -un)"
find /etc -maxdepth 1 -type f | head -8
find /etc -mindepth 1 -maxdepth 1 -type d | head -8
```

### 08-programs.png

```bash
command -v python3
type cd
type ls
printf "%s\n" "$PATH" | tr : "\n"
/usr/bin/python3 --version
```

### 09-usrmerge.png

```bash
ls -ld /bin /sbin /lib
readlink /bin
readlink -f /bin
ls /usr
ls /usr/local
```

### 10-var.png

```bash
ls /var
ls -lah /var/log | head -12
ls /var/lib | head -8
journalctl -n 3 --no-pager
```

### 11-temporary.png

```bash
ls -ld /tmp /var/tmp /run
findmnt -T /run -o TARGET,SOURCE,FSTYPE
findmnt -T /tmp -o TARGET,SOURCE,FSTYPE
ls /run | head -8
```

### 12-dev.png

```bash
ls -l /dev/null /dev/zero
file /dev/null
printf "test\n" > /dev/null
printf "exit status: %s\n" "$?"
lsblk -o NAME,TYPE,SIZE,MOUNTPOINTS
```

### 13-proc.png

```bash
head -8 /proc/meminfo
echo $$
readlink /proc/$$/cwd
readlink /proc/$$/exe
findmnt -T /proc/meminfo -o TARGET,SOURCE,FSTYPE
```

### 14-sys.png

```bash
ls /sys
ls /sys/class/net
cat /sys/class/net/lo/operstate
findmnt -T /sys -o TARGET,SOURCE,FSTYPE
```

### 15-types.png

```bash
cd ~/linux-fhs-lab
file data/info.txt /usr/bin/python3 /dev/null
file -L /usr/bin/python3
ls -ld data data/info.txt /bin /dev/null
```

### 16-links.png

```bash
cd ~/linux-fhs-lab
ln -s data/info.txt info-link.txt
ls -l info-link.txt
cat info-link.txt
readlink info-link.txt
readlink -f info-link.txt
```

### 17-inode.png

```bash
cd ~/linux-fhs-lab
stat data/info.txt
ls -li data/info.txt
ln data/info.txt data/info-hard.txt
ls -li data/info*
```

### 18-mounts.png

```bash
findmnt -o TARGET,SOURCE,FSTYPE | head -10
findmnt / -o TARGET,SOURCE,FSTYPE | cat
findmnt -T "$HOME" -o TARGET,SOURCE,FSTYPE | cat
lsblk -e 7 -o NAME,TYPE,SIZE,FSTYPE,MOUNTPOINTS
```

### 19-space.png

```bash
cd ~/linux-fhs-lab
ls -lh data/info.txt
du -sh data
df -h .
df -i .
```

### 20-mount-before.png

```bash
cd ~/linux-fhs-lab
mkdir -p mount-demo
printf "on original filesystem\n" > mount-demo/before.txt
ls mount-demo
sudo mount -t tmpfs -o size=16M tmpfs "$HOME/linux-fhs-lab/mount-demo"
findmnt -T "$HOME/linux-fhs-lab/mount-demo" -o TARGET,SOURCE,FSTYPE
ls -la mount-demo
```

### 21-mount-after.png

```bash
cd ~/linux-fhs-lab
printf "inside tmpfs\n" | sudo tee mount-demo/inside.txt
ls mount-demo
sudo umount "$HOME/linux-fhs-lab/mount-demo"
cat mount-demo/before.txt
findmnt -T "$HOME/linux-fhs-lab/mount-demo" -o TARGET,SOURCE,FSTYPE
```

### 22-placement.png

```bash
cd ~/linux-fhs-lab
mkdir -p model-root/{usr/local/bin,etc/shop-api,var/lib/shop-api,var/log/shop-api,run/shop-api}
cp config/app.conf model-root/etc/shop-api/
cp data/info.txt model-root/var/lib/shop-api/
printf "service started\n" > model-root/var/log/shop-api/app.log
find model-root -type f
```

### 23-report.png

```bash
cd ~/linux-fhs-lab
printf "# Linux FHS lab\n\n" > README.md
printf "## System\n" >> README.md
cat /etc/os-release | head -4 >> README.md
printf "\n## Root filesystem\n" >> README.md
findmnt / -o TARGET,SOURCE,FSTYPE >> README.md
cat README.md
```
