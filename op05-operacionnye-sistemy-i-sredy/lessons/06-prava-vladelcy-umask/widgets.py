# Интерактивные схемы занятия 6: права каталога, калькулятор прав и маска umask.
# Поведение — в lesson.js; результаты схемы прав каталога сверены со снимками 03 и 04.
import html, json
E = html.escape

# Действия с каталогом docs: (команда, что нужно, что выводит при успехе)
DIR_ACTIONS = [
    ('ls docs', 'r', 'notes.txt'),
    ('ls -l docs', 'rx', '-rw-r--r-- 1 ubuntu ubuntu 14 … notes.txt'),
    ('cat docs/notes.txt', 'x', 'Meeting notes'),
    ('cd docs', 'x', '(приглашение меняется на ~/perm-lab/docs)'),
    ('touch docs/new.txt', 'wx', '(файл создан, вывода нет)'),
    ('rm docs/notes.txt', 'wx', '(файл удалён, вывода нет)'),
]


def w_dirperm():
    data = json.dumps(DIR_ACTIONS, ensure_ascii=False)
    bits = ''.join(f'<button type="button" class="bit" data-bit="{b}" aria-pressed="true">{b}<small>{t}</small></button>'
                   for b, t in (('r', 'читать список'), ('w', 'менять список'), ('x', 'входить и открывать')))
    return ('<div class="model dirperm" data-widget="dirperm" data-actions="' + E(data) + '">'
            '<div class="model-head"><span>Схема · что разрешают права каталога</span></div>'
            f'<div class="dp-pick"><small>Права владельца на каталог docs — нажмите, чтобы снять или вернуть</small><div class="dp-bits">{bits}</div>'
            '<code class="dp-line"></code></div>'
            '<ol class="dp-rows" aria-live="polite"></ol></div>')


def w_calc():
    rows = ''
    for who, name in (('u', 'владелец'), ('g', 'группа'), ('o', 'остальные')):
        cells = ''.join(f'<label><input type="checkbox" data-who="{who}" data-p="{p}"><span>{p}</span></label>' for p in 'rwx')
        rows += f'<div class="calc-row"><b>{name}</b>{cells}<output data-digit="{who}">0</output></div>'
    specials = ''.join(f'<label><input type="checkbox" data-sp="{v}"><span>{t}</span></label>' for v, t in ((4, 'setuid'), (2, 'setgid'), (1, 'sticky')))
    return ('<div class="model calc" data-widget="calc">'
            '<div class="model-head"><span>Схема · перевод прав</span><div class="calc-kind" role="group" aria-label="Объект">'
            '<button type="button" data-kind="-" aria-pressed="true">файл</button><button type="button" data-kind="d" aria-pressed="false">каталог</button></div></div>'
            f'<div class="calc-grid">{rows}<div class="calc-row calc-sp"><b>особые биты</b>{specials}</div></div>'
            '<div class="calc-out"><label>Число <input class="calc-num" inputmode="numeric" maxlength="4" value="644" aria-label="Права числом"></label>'
            '<code class="calc-str"></code></div>'
            '<dl class="calc-cmds"><dt>chmod числом</dt><dd><code class="calc-c1"></code></dd><dt>chmod буквами</dt><dd><code class="calc-c2"></code></dd></dl>'
            '<ul class="calc-mean" aria-live="polite"></ul></div>')


def w_umask():
    presets = ''.join(f'<button type="button" data-mask="{m}" aria-pressed="{str(m == "0002").lower()}">{m}</button>' for m in ('0002', '0022', '0027', '0077', '0033'))
    return ('<div class="model umaskw" data-widget="umask">'
            f'<div class="model-head"><span>Схема · маска и права новых файлов</span><div class="um-presets" role="group" aria-label="Маска">{presets}</div></div>'
            '<div class="um-in"><label>umask <input class="um-num" inputmode="numeric" maxlength="4" value="0002" aria-label="Маска"></label></div>'
            '<div class="um-tables"></div></div>')


WIDGETS = dict(dirperm=w_dirperm, calc=w_calc, umask=w_umask)
