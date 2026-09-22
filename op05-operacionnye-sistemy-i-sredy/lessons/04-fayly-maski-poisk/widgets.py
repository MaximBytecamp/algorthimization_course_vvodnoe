# Интерактивные схемы занятия 4: раскрытие маски оболочкой и отбор файлов командой find.
# Данные совпадают с учебным набором files-lab-setup.sh и снимками 09–13:
# имена каталога inbox, размеры в байтах и возраст в сутках на момент съёмки (21 сентября 2026).
import html, json
E = html.escape

# (путь от inbox, тип f/d, размер в байтах, возраст в сутках)
INBOX = [
    ('README.TXT', 'f', 14, 0), ('app.log', 'f', 30, 0), ('app.log.1', 'f', 10, 51), ('app.log.2', 'f', 12, 134),
    ('archive', 'd', 0, 0), ('config.yaml.bak', 'f', 11, 51), ('data-old.csv', 'f', 23, 134), ('data.csv', 'f', 23, 0),
    ('data.csv.bak', 'f', 23, 0), ('dump.bin', 'f', 5242880, 0), ('error.log', 'f', 17, 0), ('my report.txt', 'f', 6, 0),
    ('notes.md', 'f', 8, 0), ('photo-001.jpg', 'f', 40000, 0), ('photo-002.jpg', 'f', 80000, 0), ('photo-003.jpg', 'f', 120000, 0),
    ('photo-004.jpg', 'f', 160000, 0), ('photo-005.jpg', 'f', 200000, 0), ('photo-010.png', 'f', 120000, 0),
    ('report-2026-01.txt', 'f', 19, 134), ('report-2026-02.txt', 'f', 19, 134), ('report-2026-03.txt', 'f', 19, 51),
    ('report-2026-10.txt', 'f', 19, 0), ('report-2026-11.txt', 'f', 19, 0), ('report-final.txt', 'f', 13, 0),
    ('todo.md', 'f', 20, 0), ('.settings', 'f', 15, 0),
    ('archive/2025', 'd', 0, 0), ('archive/2025/budget.csv', 'f', 18, 134), ('archive/2025/plan.txt', 'f', 10, 134),
]

GLOB_PRESETS = ['ls *.txt', 'ls report-2026-0?.txt', 'ls photo-00[1-3].jpg', 'ls report-2026-[!0]?.txt', 'ls *.{jpg,png}',
                'echo *.docx', 'echo "*.log"', 'echo .*', 'rm -v *.bak', 'ls -l my report.txt']

SIEVE_PRESETS = ['find inbox -type f -size +1M', 'find inbox -type f -size +100k -size -500k', 'find inbox -type f -size +100k -size -1M',
                 'find inbox -type f -mtime +30', 'find inbox -name "*.csv"', 'find inbox -iname "readme*"', 'find inbox -type d']


def w_expand():
    top = [x for x in INBOX if '/' not in x[0]]
    files = json.dumps([[n, t] for n, t, _, _ in top])
    buttons = ''.join(f'<button type="button" data-cmd="{E(c)}">{E(c)}</button>' for c in GLOB_PRESETS)
    return ('<div class="model expand" data-widget="expand" data-files="' + E(files) + '">'
            '<div class="model-head"><span>Схема · раскрытие маски</span></div>'
            '<div class="expand-in"><div class="expand-cmd"><label for="expand-input">Команда в каталоге ~/files-lab/inbox</label>'
            '<div class="expand-row"><span class="pr">$</span><input id="expand-input" type="text" value="ls *.txt" spellcheck="false" autocomplete="off">'
            '<button type="button" class="expand-run">Раскрыть</button></div>'
            f'<div class="expand-presets">{buttons}</div></div>'
            '<ol class="expand-stages" aria-live="polite">'
            '<li data-stage="1"><b>1. Оболочка делит строку на слова</b><div class="expand-words"></div></li>'
            '<li data-stage="2"><b>2. Маски сравниваются с именами в каталоге</b><ul class="expand-files"></ul></li>'
            '<li data-stage="3"><b>3. Команда получает готовый список</b><div class="expand-argv"></div><p class="expand-note"></p></li>'
            '</ol></div></div>')


def w_sieve():
    data = json.dumps(INBOX)
    buttons = ''.join(f'<button type="button" data-find="{E(c)}">{E(c)}</button>' for c in SIEVE_PRESETS)
    return ('<div class="model sieve" data-widget="sieve" data-entries="' + E(data) + '">'
            '<div class="model-head"><span>Схема · отбор файлов командой find</span></div>'
            f'<div class="sieve-presets">{buttons}</div>'
            '<div class="sieve-tests" aria-live="polite"></div>'
            '<ul class="sieve-grid"></ul>'
            '<pre class="sieve-out" aria-live="polite"></pre></div>')


WIDGETS = dict(expand=w_expand, sieve=w_sieve)
