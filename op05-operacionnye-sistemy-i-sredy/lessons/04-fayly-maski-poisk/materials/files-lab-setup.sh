#!/bin/bash
# Учебный набор к занятию 4 ОП.05 «Файлы, маски, поиск и справка».
# Создаёт каталог ~/files-lab/inbox с перемешанными файлами.
# Повторный запуск удаляет только ~/files-lab/inbox и создаёт его заново.
set -e
LAB="$HOME/files-lab"
rm -rf "$LAB/inbox"
mkdir -p "$LAB/inbox/archive/2025"
cd "$LAB/inbox"

for m in 01 02 03 10 11; do printf "Report for 2026-%s\n" "$m" > "report-2026-$m.txt"; done
printf "Final report\n" > report-final.txt
printf "Draft\n" > "my report.txt"
printf "Read me first\n" > README.TXT

for n in 1 2 3 4 5; do head -c $((n * 40000)) /dev/urandom > "photo-00$n.jpg"; done
head -c 120000 /dev/urandom > photo-010.png

printf "service started\nservice ready\n" > app.log
printf "old start\n" > app.log.1
printf "older start\n" > app.log.2
printf "error: disk full\n" > error.log

printf "# Notes\n" > notes.md
printf "# TODO\n- sort inbox\n" > todo.md
printf "id,name\n1,alpha\n2,beta\n" > data.csv
cp data.csv data-old.csv
cp data.csv data.csv.bak
printf "mode: test\n" > config.yaml.bak
printf "token=lab-only\n" > .settings
head -c 5242880 /dev/zero > dump.bin

printf "Plan 2025\n" > archive/2025/plan.txt
printf "year,sum\n2025,100\n" > archive/2025/budget.csv

touch -d "2026-05-10 10:00" report-2026-01.txt report-2026-02.txt app.log.2 data-old.csv archive/2025/*
touch -d "2026-08-01 10:00" report-2026-03.txt app.log.1 config.yaml.bak

echo "Ready: $(find "$LAB/inbox" -type f | wc -l) files in $LAB/inbox"
