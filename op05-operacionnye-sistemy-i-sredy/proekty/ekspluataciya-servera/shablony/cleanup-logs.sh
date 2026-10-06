#!/bin/bash
# cleanup-logs.sh — очистка раздела журналов billing по политике хранения.
#   sudo bash cleanup-logs.sh          — только показать, что будет удалено
#   sudo bash cleanup-logs.sh --apply  — удалить
set -eu
DIR=/var/log/billing
DAYS=7
APPLY=no
[ "${1:-}" = --apply ] && APPLY=yes

[ -d "$DIR" ] || { echo "Нет каталога $DIR"; exit 1; }

echo "Раздел до очистки:"; df -h "$DIR" | tail -1

# TODO: что удаляется и что не трогается — по требованиям ТЗ.
candidates() {
  # TODO: вставить условия между -type f и "$@"
  find "$DIR" -type f "$@"
}

echo "Будет удалено:"
candidates -ls

if [ "$APPLY" = yes ]; then
  # TODO: удалить найденные файлы
  echo "Раздел после очистки:"; df -h "$DIR" | tail -1
else
  echo "Ничего не удалено. Для удаления: sudo bash $0 --apply"
fi
