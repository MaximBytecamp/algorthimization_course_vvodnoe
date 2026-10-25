#!/bin/sh
# Нагрузка для практики: одинаковая у всех, поэтому числа в ответах совпадают.
#   200 запросов GET /deliveries/1 … /200 и 20 запросов к /301 … /320 (ответ 404)
#   30 заявок: north — 15, south — 10, center — 5
#   20 расчётов маршрута с заданной длительностью
A=http://localhost:8033
for i in $(seq 1 200); do curl -s -o /dev/null $A/deliveries/$i; done
for i in $(seq 301 320); do curl -s -o /dev/null $A/deliveries/$i; done
for z in north south center; do
  case $z in north) n=15;; south) n=10;; center) n=5;; esac
  for i in $(seq 1 $n); do curl -s -o /dev/null -X POST "$A/deliveries?zone=$z"; done
done
for ms in 40 60 80 120 140 170 180 230 260 270 320 350 380 420 460 550 650 800 1100 1600; do
  curl -s -o /dev/null "$A/route?ms=$ms" &
done
wait
echo "нагрузка отправлена"
