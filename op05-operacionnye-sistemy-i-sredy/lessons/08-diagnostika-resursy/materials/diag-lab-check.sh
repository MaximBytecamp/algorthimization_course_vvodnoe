#!/bin/bash
# Проверка практической работы занятия 8 ОП.05. Ничего не изменяет, только смотрит процессы и ~/diag-lab.
LAB="$HOME/diag-lab"
ok=0; total=0
check() {  # check "что проверяем" команда...
  local name="$1"; shift
  total=$((total + 1))
  if "$@" >/dev/null 2>&1; then ok=$((ok + 1)); printf "  OK    %s\n" "$name"
  else printf "  НЕТ   %s\n" "$name"; fi
}
gone() { ! pgrep -f "$1" >/dev/null; }
all_reniced() {  # каждый расчёт (их по два на ядро) хотя бы раз записал nice=19
  [ "$(grep "nice=19" "$LAB/report.log" | awk '{print $3}' | sort -u | wc -l)" -eq $(( $(nproc) * 2 )) ]
}
section() {  # в разделе postmortem есть хотя бы одна непустая строка
  awk -v h="## $1" '$0==h{f=1;next} /^## /{f=0} f&&NF{found=1} END{exit !found}' "$LAB/postmortem.md"
}

echo "Проверка ~/diag-lab"
check "Сервер запускался: есть журнал web.log"              test -s "$LAB/web.log"
check "web-worker работает: его не остановили по ошибке"    pgrep -f "$LAB/bin/web-worker.sh"
check "Всем расчётам понижен приоритет до nice 19"       all_reniced
check "report-builder завершён"                             gone "$LAB/bin/report-builder.sh"
check "Расчёты report-calc завершены"         gone "$LAB/bin/report-calc.sh"
check "sync-agent завершён принудительно: сигнал 9"         grep -q "^sync-agent .* signal 9" "$LAB/exit-codes.log"
check "Устаревшая блокировка sync.lock удалена"             test ! -e "$LAB/sync.lock"
for s in Симптом Причина Действия Профилактика; do
  check "В postmortem заполнен раздел «$s»"                 section "$s"
done

echo "Итог: $ok из $total"
