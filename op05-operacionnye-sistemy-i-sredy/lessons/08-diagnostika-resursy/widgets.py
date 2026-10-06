# Интерактивные схемы занятия 8: очередь к ядрам (load average) и доли процессора при разных nice.
# Поведение — в lesson.js. Веса nice — таблица sched_prio_to_weight ядра Linux.
import html, json
E = html.escape

# Вес процесса для nice от −20 до 19: nice 0 — 1024, каждая единица — примерно в 1,25 раза.
WEIGHTS = [88761, 71755, 56483, 46273, 36291, 29154, 23254, 18705, 14949, 11916,
           9548, 7620, 6100, 4904, 3906, 3121, 2501, 1991, 1586, 1277,
           1024, 820, 655, 526, 423, 335, 272, 215, 172, 137,
           110, 87, 70, 56, 45, 36, 29, 23, 18, 15]


def w_load():
    cores = ''.join(f'<button type="button" data-cores="{n}" aria-pressed="{str(n == 2).lower()}">{n}</button>' for n in (1, 2, 4))
    return ('<div class="model loadq" data-widget="load">'
            f'<div class="model-head"><span>Схема · очередь к ядрам</span><div class="pl-cases" role="group" aria-label="Число ядер">ядер: {cores}</div></div>'
            '<div class="lq-body"><label class="lq-range">Процессов готовы работать: <b class="lq-n">3</b>'
            '<input type="range" min="0" max="8" value="3" aria-label="Число процессов, готовых работать"></label>'
            '<div class="lq-stage"><div class="lq-cores" aria-hidden="true"></div><div class="lq-queue" aria-hidden="true"></div></div>'
            '<p class="lq-text" aria-live="polite"></p></div></div>')


def w_nice():
    opts = lambda v: ''.join(f'<option value="{n}"{" selected" if n == v else ""}>{n}</option>' for n in range(-20, 20))
    return (f'<div class="model nicew" data-widget="nice" data-weights="{E(json.dumps(WEIGHTS))}">'
            '<div class="model-head"><span>Схема · два процесса делят одно ядро</span></div>'
            '<div class="nw-body"><div class="nw-pick">'
            f'<label>nice процесса A <select data-p="a">{opts(0)}</select></label>'
            f'<label>nice процесса B <select data-p="b">{opts(10)}</select></label></div>'
            '<div class="nw-bar" aria-hidden="true"><div class="nw-a"><span></span></div><div class="nw-b"><span></span></div></div>'
            '<p class="nw-text" aria-live="polite"></p></div></div>')


WIDGETS = dict(load=w_load, nice=w_nice)
