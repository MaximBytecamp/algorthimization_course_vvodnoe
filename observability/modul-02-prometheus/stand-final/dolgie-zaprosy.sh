#!/bin/sh
# Пять запросов, каждый обрабатывается 40 секунд. Пока они выполняются,
# метрика items_in_progress равна 5. Команда завершается через 40 секунд.
for i in 1 2 3 4 5; do curl -s -o /dev/null "http://localhost:8020/items/$i?wait=40" & done
echo "Пять запросов выполняются 40 секунд. Откройте http://localhost:8020/metrics"
wait
echo "Запросы завершены."
