#!/bin/bash
# Учебный набор к занятию 6 ОП.05 «Права доступа, владельцы и umask».
# Создаёт каталог ~/perm-lab с файлами для опытов и учётные записи anna и boris в группе devteam.
# Повторный запуск создаёт ~/perm-lab заново; учётные записи не пересоздаются.
set -e
LAB="$HOME/perm-lab"
rm -rf "$LAB"
mkdir -p "$LAB/docs" "$LAB/private"
cd "$LAB"
printf 'Report Q3\n' > report.txt
printf '#!/bin/bash\necho "backup done"\n' > backup.sh
printf 'DB_PASSWORD=lab-only\n' > db.env
printf 'Meeting notes\n' > docs/notes.txt
chmod 644 report.txt backup.sh db.env docs/notes.txt
chmod 755 docs private
getent group devteam >/dev/null || sudo groupadd devteam
for u in anna boris; do
  id "$u" >/dev/null 2>&1 || sudo useradd -m -s /bin/bash "$u"
  sudo usermod -aG devteam "$u"
done
echo "Ready: $LAB, users anna and boris in group devteam"
