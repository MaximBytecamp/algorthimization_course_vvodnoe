#!/bin/bash
# Проверка практической работы занятия 6 ОП.05: каталог проекта /srv/shop.
# Запуск: sudo bash perms-lab-check.sh
# Скрипт проверяет права и доступ от имени каждого пользователя и удаляет только свои пробные файлы.
if [ "$(id -u)" -ne 0 ]; then echo "Запустите через sudo: sudo bash $0"; exit 1; fi
S=/srv/shop
ok=0; total=0
check() {  # check "что проверяем" ожидание(yes|no) команда...
  local name="$1" want="$2"; shift 2
  total=$((total + 1))
  if "$@" >/dev/null 2>&1; then got=yes; else got=no; fi
  if [ "$got" = "$want" ]; then ok=$((ok + 1)); printf "  OK    %s\n" "$name"
  else printf "  НЕТ   %s\n" "$name"; fi
}
mode() { test "$(stat -c '%U %G %a' "$1" 2>/dev/null)" = "$2"; }
in_group() { id -nG "$1" 2>/dev/null | tr ' ' '\n' | grep -qx "$2"; }

echo "Пользователи и группа"
check "alex и bella в группе shop-dev" yes eval 'in_group alex shop-dev && in_group bella shop-dev'
check "chris не входит в shop-dev"     no  in_group chris shop-dev

echo "Каталоги"
check "src: root shop-dev 2770"      yes mode $S/src "root shop-dev 2770"
check "releases: root shop-dev 2775" yes mode $S/releases "root shop-dev 2775"
check "uploads: root shop-dev 3770"  yes mode $S/uploads "root shop-dev 3770"

echo "Файлы"
check "src/app.py: группа shop-dev, bella дописала строку" yes eval "test \$(stat -c %G $S/src/app.py) = shop-dev && test \$(wc -l < $S/src/app.py) -ge 2"
check "src/config.env: владелец alex, права 600"          yes mode $S/src/config.env "alex shop-dev 600"
check "releases/v1.txt: владелец bella"                   yes test "$(stat -c %U $S/releases/v1.txt 2>/dev/null)" = bella

echo "Доступ"
check "bella создаёт файл в src"          yes eval "sudo -u bella touch $S/src/.check && rm -f $S/src/.check"
check "bella не читает config.env"        no  sudo -u bella cat $S/src/config.env
check "chris не открывает src"            no  sudo -u chris ls $S/src
check "chris читает releases/v1.txt"      yes sudo -u chris cat $S/releases/v1.txt
check "chris не создаёт файлы в releases" no  sudo -u chris touch $S/releases/.check
sudo -u bella touch $S/uploads/.check-bella 2>/dev/null
check "alex не удаляет файл bella в uploads" no sudo -u alex rm -f $S/uploads/.check-bella
rm -f $S/uploads/.check-bella $S/releases/.check

echo "Итог: $ok из $total"
