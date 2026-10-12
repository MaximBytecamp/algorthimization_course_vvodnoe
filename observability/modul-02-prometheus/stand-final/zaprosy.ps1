# Запросы к приложению: 20 успешных, один с ответом 404 и один POST с ответом 405.
1..20 | ForEach-Object { curl.exe -s -o NUL "http://localhost:8020/items/$_" }
curl.exe -s -o NUL http://localhost:8020/items/500
curl.exe -s -o NUL -X POST http://localhost:8020/items/1
Write-Output "Отправлено 22 запроса. Счётчик: http://localhost:8020/metrics"
