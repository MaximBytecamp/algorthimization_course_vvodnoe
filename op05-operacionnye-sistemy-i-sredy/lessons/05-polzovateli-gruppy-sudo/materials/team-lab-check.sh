#!/bin/bash
# Проверка практической работы занятия 5 ОП.05: команда проекта mobile-app.
# Запуск: sudo bash team-lab-check.sh
# Скрипт проверяет доступ от имени каждого пользователя и удаляет только свои пробные файлы.
if [ "$(id -u)" -ne 0 ]; then echo "Запустите через sudo: sudo bash $0"; exit 1; fi

ok=0; total=0
check() {  # check "что проверяем" ожидание(yes|no) команда...
  local name="$1" want="$2"; shift 2
  total=$((total + 1))
  if "$@" >/dev/null 2>&1; then got=yes; else got=no; fi
  if [ "$got" = "$want" ]; then ok=$((ok + 1)); printf "  OK    %s\n" "$name"
  else printf "  НЕТ   %s\n" "$name"; fi
}
in_group() { id -nG "$1" 2>/dev/null | tr ' ' '\n' | grep -qx "$2"; }
can_write() { sudo -u "$1" touch "$2/.check-$1" && rm -f "$2/.check-$1"; }
can_list() { sudo -u "$1" ls "$2"; }

echo "Учётные записи и группы"
for u in lead dev qa guest; do check "пользователь $u существует" yes id "$u"; done
check "lead в группе mobile-dev"  yes in_group lead mobile-dev
check "lead в группе mobile-qa"   yes in_group lead mobile-qa
check "lead в группе sudo"        yes in_group lead sudo
check "dev в группе mobile-dev"   yes in_group dev mobile-dev
check "dev не входит в группу sudo" no  in_group dev sudo
check "qa в группе mobile-qa"     yes in_group qa mobile-qa
check "guest не входит в mobile-dev" no  in_group guest mobile-dev

echo "Каталоги"
check "/srv/mobile/src: группа mobile-dev, права 2770"     yes test "$(stat -c '%G %a' /srv/mobile/src 2>/dev/null)" = "mobile-dev 2770"
check "/srv/mobile/reports: группа mobile-qa, права 2770"  yes test "$(stat -c '%G %a' /srv/mobile/reports 2>/dev/null)" = "mobile-qa 2770"

echo "Доступ"
check "dev создаёт файл в src"        yes can_write dev /srv/mobile/src
check "dev не открывает reports"      no  can_list dev /srv/mobile/reports
check "qa создаёт файл в reports"     yes can_write qa /srv/mobile/reports
check "qa не открывает src"           no  can_list qa /srv/mobile/src
check "lead создаёт файл в src"       yes can_write lead /srv/mobile/src
check "lead создаёт файл в reports"   yes can_write lead /srv/mobile/reports
check "guest не открывает src"        no  can_list guest /srv/mobile/src
check "guest не открывает reports"    no  can_list guest /srv/mobile/reports

echo "Итог: $ok из $total"
