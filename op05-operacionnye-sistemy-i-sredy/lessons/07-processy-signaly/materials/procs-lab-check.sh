#!/bin/bash
# Проверка практической работы занятия 7 ОП.05. Ничего не изменяет, только смотрит процессы и ~/procs-lab.
LAB="$HOME/procs-lab"
ok=0; total=0
check() {  # check "что проверяем" команда...
  local name="$1"; shift
  total=$((total + 1))
  if "$@" >/dev/null 2>&1; then ok=$((ok + 1)); printf "  OK    %s\n" "$name"
  else printf "  НЕТ   %s\n" "$name"; fi
}
gone() { ! pgrep -f "$1" >/dev/null; }

echo "Проверка ~/procs-lab"
check "Набор запускался: есть журнал worker.log"         test -s "$LAB/worker.log"
check "hog.sh завершён"                                  gone "$LAB/bin/hog.sh"
check "paused.sh завершён"                               gone "$LAB/bin/paused.sh"
check "worker.sh завершён"                               gone "$LAB/bin/worker.sh"
check "stubborn.sh получил TERM: запись в stubborn.log"  grep -q "TERM ignored" "$LAB/stubborn.log"
check "stubborn.sh завершён"                             gone "$LAB/bin/stubborn.sh"
check "lab-parent завершён, зомби не осталось"           eval '! pgrep -f lab-parent && ! ps -u "$USER" -o stat= | grep -q "^Z"'
check "hog.sh завершён мягко: сигнал 15"                  grep -q "^hog .* signal 15" "$LAB/exit-codes.log"
check "stubborn.sh завершён принудительно: сигнал 9"     grep -q "^stubborn .* signal 9" "$LAB/exit-codes.log"
check "Диспетчер manager.py завершился сам"             gone "$LAB/bin/manager.py"
check "В отчёте есть таблица состояний"                  grep -qE "hog.*R|R.*hog" "$LAB/states.md"

echo "Итог: $ok из $total"
