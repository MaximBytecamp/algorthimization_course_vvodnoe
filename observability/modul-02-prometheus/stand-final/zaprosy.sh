#!/bin/sh
# Запросы к приложению: 20 успешных, один с ответом 404 и один POST с ответом 405.
for i in $(seq 1 20); do curl -s -o /dev/null http://localhost:8020/items/$i; done
curl -s -o /dev/null http://localhost:8020/items/500
curl -s -o /dev/null -X POST http://localhost:8020/items/1
echo "Отправлено 22 запроса. Счётчик: http://localhost:8020/metrics"
