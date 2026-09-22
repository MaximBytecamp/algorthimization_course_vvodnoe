#!/bin/bash
# Проверка практической работы занятия 4 ОП.05. Ничего не изменяет, только читает ~/files-lab.
LAB="$HOME/files-lab"
IN="$LAB/inbox"
S="$LAB/sorted"
ok=0; total=0

check() {  # check "название" условие...
  local name="$1"; shift
  total=$((total + 1))
  if "$@" >/dev/null 2>&1; then ok=$((ok + 1)); printf "  OK    %s\n" "$name"
  else printf "  НЕТ   %s\n" "$name"; fi
}
count() { find "$1" -maxdepth 1 -type f -name "$2" 2>/dev/null | wc -l; }
eq() { [ "$1" -eq "$2" ]; }

echo "Проверка ~/files-lab"
check "1. Каталоги sorted/docs, images, logs, data"  test -d "$S/docs" -a -d "$S/images" -a -d "$S/logs" -a -d "$S/data"
check "2. Семь документов в docs"                    eq "$(count "$S/docs" '*.txt')" 7
check "3. Шесть изображений в images"                eq "$(( $(count "$S/images" '*.jpg') + $(count "$S/images" '*.png') ))" 6
check "4. Четыре журнала в logs"                     eq "$(count "$S/logs" '*.log*')" 4
check "5. CSV скопированы, оригиналы на месте"       eq "$(( $(count "$S/data" '*.csv') + $(count "$IN" '*.csv') ))" 4
check "6. Имя без пробела: docs/my-report.txt"       test -f "$S/docs/my-report.txt"
check "7. Резервные копии *.bak удалены"             eq "$(count "$IN" '*.bak')" 0
check "8. Файл больше 1 МБ удалён"                   eq "$(find "$LAB" -type f -size +1M | wc -l)" 0
check "9. В ответах есть значение token"             grep -q "lab-only" "$LAB/answers.txt"
check "10. В ответах есть ключ сортировки ls"        grep -q -- "-S" "$LAB/answers.txt"
check "11. В ответах есть путь из locate"            grep -q "os-release" "$LAB/answers.txt"
check "12. Журнал команд: не меньше 12 строк"        test "$(grep -c '^|' "$LAB/journal.md" 2>/dev/null)" -ge 14

echo "Итог: $ok из $total"
