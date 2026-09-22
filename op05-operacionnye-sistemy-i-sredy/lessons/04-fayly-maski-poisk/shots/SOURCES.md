# Происхождение снимков

Все PNG — реальные кадры дисплея виртуальной машины, без генерации или перерисовки терминала.

- Дата: 21 сентября 2026 года, 21:36–21:45 по времени виртуальной машины (UTC).
- VM: Ubuntu-lab-01, VirtualBox 7.2 на macOS ARM64.
- Ubuntu Desktop 24.04.4 LTS ARM64, Live-сеанс с установочного ISO.
- Пользователь: ubuntu; оболочка Bash; локаль C.UTF-8.
- Экран: 1280 × 800; окно GNOME Terminal развёрнуто.
- Снимки: `VBoxManage controlvm Ubuntu-lab-01 screenshotpng`.
- Ввод команд: `VBoxManage controlvm … keyboardputstring` построчно с паузой; перед каждым кадром выполнялась команда `clear`.
- Перед съёмкой установлены пакеты `plocate` и `tree` (`sudo apt-get install plocate tree`); для доступа к зеркалу в Live-сеансе указан DNS: `sudo resolvectl dns enp0s8 1.1.1.1 8.8.8.8`.
- Скрипты `files-lab-setup.sh` и `files-lab-check.sh` скопированы в `~/Downloads` из каталога `materials` урока.
- Все созданные файлы: `~/files-lab`. Системная конфигурация и виртуальные диски не изменялись.

Пути `/rofs` и `/snap/core22` в выводе `locate` относятся к Live-сеансу и пакетам snap. Номера строк истории, время и даты в вашей системе будут другими.

## Кадры и выполненные команды

### 01-mkdir.png

Подготовка (не снималась):

```bash
rm -rf ~/files-lab
```

```bash
cd ~
mkdir files-lab
cd files-lab
mkdir site/css
mkdir -p site/css site/img
touch site/index.html site/css/style.css
ls
tree
```

### 02-touch.png

```bash
cd ~/files-lab
ls -l --time-style=+%T site/index.html
touch site/index.html
ls -l --time-style=+%T site/index.html
touch -d "2026-01-15 09:00" site/index.html
ls -l site/index.html
```

### 03-setup.png

```bash
cd ~/files-lab
bash ~/Downloads/files-lab-setup.sh
ls inbox
ls -A inbox
ls -lh inbox/dump.bin inbox/photo-001.jpg
```

### 04-cp.png

```bash
cd ~/files-lab/inbox
mkdir ../backup
cp -v data.csv ../backup/
cp -v report-final.txt ../backup/final-copy.txt
cp archive ../backup/
cp -rv archive ../backup/
cp -i data.csv ../backup/
n
ls -R ../backup
```

### 05-mv.png

```bash
cd ~/files-lab/inbox
mv -v notes.md notes-2026.md
mkdir -p ../sorted/logs
mv -v app.log.1 app.log.2 ../sorted/logs/
mv -i todo.md notes-2026.md
n
ls ../sorted/logs
ls notes* todo*
```

### 06-rm.png

```bash
cd ~/files-lab/inbox
rm -v data-old.csv
rm -i data.csv.bak
y
rm ../backup
rmdir ../backup
rm -rv ../backup
ls ..
```

### 07-space.png

```bash
cd ~/files-lab/inbox
ls -l my report.txt
ls -l "my report.txt"
ls -l my\ report.txt
mv -v "my report.txt" my-report.txt
ls -l my*
```

### 08-ln.png

```bash
cd ~/files-lab
ln -s inbox/report-final.txt latest-report.txt
ls -l latest-report.txt
cat latest-report.txt
cp -v latest-report.txt report-copy.txt
ls -l latest-report.txt report-copy.txt
```

### 09-glob.png

```bash
cd ~/files-lab
bash ~/Downloads/files-lab-setup.sh
cd inbox
ls *.txt
ls report-2026-0?.txt
ls photo-00[1-3].jpg
ls report-2026-[!0]?.txt
ls *.{jpg,png}
```

### 10-glob-echo.png

```bash
cd ~/files-lab/inbox
echo *.log
echo app.log*
echo *.docx
ls *.docx
echo "*.log"
echo .*
echo *
```

### 11-glob-rm.png

```bash
cd ~/files-lab/inbox
ls *.bak
rm -v *.bak
ls *.bak
```

### 12-find-name.png

```bash
cd ~/files-lab
find . -name "*.csv"
find . -iname "readme*"
find . -type d
cd inbox
find . -name *.csv
find . -name "*.csv"
```

### 13-find-size-time.png

```bash
cd ~/files-lab
find . -type f -size +1M
find . -type f -size +100k -size -1M
find . -type f -size +100k -size -500k
find inbox -type f -mtime +100
find inbox -type f -mtime +30
```

### 14-find-exec.png

```bash
cd ~/files-lab
find inbox -name "app.log*" -exec ls -l {} \;
find /etc /root -name "passwd"
find /etc /root -name "passwd" 2>/dev/null
find . -name "report-copy.txt"
find . -name "report-copy.txt" -delete
find . -name "report-copy.txt"
```

### 15-locate.png

```bash
cd ~/files-lab
touch new-note.txt
locate new-note.txt
sudo updatedb
locate new-note.txt
rm new-note.txt
locate new-note.txt
locate -e new-note.txt
locate os-release
```

### 16-which.png

```bash
which ls tree locate
which cd
type ls cd tree
command -v locate
```

### 17-man-ls.png

```bash
man ls
```

### 18-man-search.png

Подготовка (не снималась):

```bash
q
```

Внутри справки набран поиск `/sort by file size` и Enter.

```bash
man ls
```

### 19-man-f.png

Подготовка (не снималась):

```bash
q
```

```bash
man -f passwd
man -k "copy files"
man cd
```

### 20-man5.png

```bash
man 5 passwd
```

### 21-help.png

Подготовка (не снималась):

```bash
q
```

```bash
ls --help | head -14
help cd | head -6
type help
```

### 22-history.png

Подготовка (не снималась):

```bash
export HISTIGNORE="clear"
```

```bash
cd ~/files-lab
ls inbox | head -3
find inbox -name "*.md"
history | tail -n 4
history | tail -n 4 > commands.txt
cat commands.txt
```

### 23-quest-tree.png

Подготовка (не снималась):

```bash
cd ~/files-lab && rm -rf sorted site latest-report.txt commands.txt answers.txt journal.md && bash ~/Downloads/files-lab-setup.sh
cd ~/files-lab/inbox && mkdir -p ../sorted/{docs,images,logs,data} && mv "my report.txt" my-report.txt && mv report-*.txt my-report.txt ../sorted/docs/ && mv *.jpg *.png ../sorted/images/ && mv *.log *.log.* ../sorted/logs/ && cp *.csv ../sorted/data/ && rm *.bak dump.bin
cd ~/files-lab && find inbox -type f -mtime +30 > answers.txt && cat inbox/.settings >> answers.txt && echo "ls -S sort by size" >> answers.txt && locate os-release | head -1 >> answers.txt && wget -q -O journal.md http://10.0.2.2:8766/journal-demo.md
```

```bash
tree ~/files-lab/sorted
```

### 24-quest-check.png

```bash
bash ~/Downloads/files-lab-check.sh
```

Ответы на вопросы команд `cp -i`, `mv -i` и `rm -i` (`n`, `n`, `y`) набраны с клавиатуры и видны на кадрах.
