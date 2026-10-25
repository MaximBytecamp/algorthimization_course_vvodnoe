# Нагрузка для практики (Windows PowerShell). То же, что nagruzka.sh.
$A = "http://localhost:8033"
1..200   | ForEach-Object { curl.exe -s -o NUL "$A/deliveries/$_" }
301..320 | ForEach-Object { curl.exe -s -o NUL "$A/deliveries/$_" }
1..15 | ForEach-Object { curl.exe -s -o NUL -X POST "$A/deliveries?zone=north" }
1..10 | ForEach-Object { curl.exe -s -o NUL -X POST "$A/deliveries?zone=south" }
1..5  | ForEach-Object { curl.exe -s -o NUL -X POST "$A/deliveries?zone=center" }
$ms = 40,60,80,120,140,170,180,230,260,270,320,350,380,420,460,550,650,800,1100,1600
$jobs = $ms | ForEach-Object { Start-Job -ArgumentList $A,$_ { param($a,$m) curl.exe -s -o NUL "$a/route?ms=$m" } }
$jobs | Wait-Job | Remove-Job
"нагрузка отправлена"
