#!/bin/bash
# audit-user.sh — сведения о доступе пользователя к серверу.
#   sudo bash audit-user.sh имя
# Ничего не изменяет, только печатает.
set -u
U=${1:-}
[ -n "$U" ] || { echo "Использование: sudo bash $0 имя"; exit 2; }
id "$U" >/dev/null 2>&1 || { echo "Нет пользователя $U"; exit 1; }
H=$(getent passwd "$U" | cut -d: -f6)

section() { echo; echo "== $*"; }

section "Учётная запись"
getent passwd "$U"
# TODO

section "Группы"
# TODO

section "Права sudo"
# TODO

section "Процессы"
# TODO

section "Файлы вне $H"
# TODO

section "Программы с setuid вне пакетов системы"
# TODO
