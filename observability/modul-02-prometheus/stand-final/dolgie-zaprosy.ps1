# Пять запросов, каждый обрабатывается 40 секунд. Пока они выполняются,
# метрика items_in_progress равна 5. Команда завершается через 40 секунд.
$jobs = 1..5 | ForEach-Object { Start-Process curl.exe -ArgumentList '-s', '-o', 'NUL', "http://localhost:8020/items/$_`?wait=40" -NoNewWindow -PassThru }
Write-Output "Пять запросов выполняются 40 секунд. Откройте http://localhost:8020/metrics"
$jobs | Wait-Process
Write-Output "Запросы завершены."
