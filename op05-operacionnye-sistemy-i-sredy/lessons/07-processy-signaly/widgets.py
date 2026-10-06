# Интерактивные схемы занятия 7: запуск команды (fork и exec), переходы между состояниями
# и судьба завершившегося процесса. Поведение — в lesson.js. Номера процессов взяты со снимков 02 и 09.
import html, json
E = html.escape

# Пошаговые сценарии: шаг — заголовок, пояснение, процессы [(имя, PID, PPID, состояние)], строка терминала.
FORK = [dict(title='Запуск команды sleep 5', steps=[
    dict(t='Оболочка ждёт ввода', p='Оболочка терминала спит в ожидании клавиш. Вы вводите sleep 5 и нажимаете Enter.',
         n=[('bash', 3537, 3524, 'S')], term='ubuntu@ubuntu:~$ sleep 5'),
    dict(t='fork: копия оболочки', p='Оболочка вызывает fork. Появляется второй процесс bash — копия с той же памятью, окружением и маской, но со своим PID. Его родитель — исходная оболочка.',
         n=[('bash', 3537, 3524, 'S'), ('bash', 4300, 3537, 'R')], term=''),
    dict(t='exec: замена программы', p='Копия вызывает exec: код bash в её памяти заменяется кодом /usr/bin/sleep. PID 4300 и родитель остаются прежними.',
         n=[('bash', 3537, 3524, 'S'), ('sleep', 4300, 3537, 'S')], term=''),
    dict(t='Родитель ждёт', p='Исходная оболочка вызывает wait и спит, пока потомок работает. Терминал занят: это задание переднего плана.',
         n=[('bash', 3537, 3524, 'S'), ('sleep', 4300, 3537, 'S')], term='(5 секунд ничего не происходит)'),
    dict(t='Потомок завершается', p='sleep отработал и завершился с кодом 0. Ядро освободило его память; запись с кодом ждёт, пока родитель её прочитает.',
         n=[('bash', 3537, 3524, 'R'), ('sleep', 4300, 3537, 'Z')], term=''),
    dict(t='wait забирает код', p='Оболочка получает код 0, запись о потомке удаляется. Код сохраняется в $?, и оболочка снова выводит приглашение.',
         n=[('bash', 3537, 3524, 'S')], term='ubuntu@ubuntu:~$ echo $?\n0'),
])]

REAP = [
    dict(title='Родитель ждёт потомка', steps=[
        dict(t='Родитель и потомок', p='Оболочка запустила sleep 100 в фоне и продолжает работу.', n=[('bash', 3537, 3524, 'S'), ('sleep', 4300, 3537, 'S')], term='$ sleep 100 &'),
        dict(t='Потомок снят сигналом', p='kill посылает TERM. sleep завершается, его запись с кодом остаётся — короткое время это зомби.', n=[('bash', 3537, 3524, 'R'), ('sleep', 4300, 3537, 'Z')], term='$ kill $!'),
        dict(t='wait читает код', p='Оболочка читает код: процесс снят сигналом 15, код 128 + 15 = 143. Запись удалена.', n=[('bash', 3537, 3524, 'S')], term='$ wait $!; echo $?\n143'),
    ]),
    dict(title='Родитель не ждёт', steps=[
        dict(t='Родитель, который не умеет ждать', p='bash запустил sleep 1 в фоне и заменил себя программой sleep 300 под именем lab-parent. Новая программа wait не вызывает.', n=[('lab-parent', 4306, 3537, 'S'), ('sleep', 4307, 4306, 'S')], term='$ bash -c \'sleep 1 & exec -a lab-parent sleep 300\' &'),
        dict(t='Потомок стал зомби', p='Через секунду потомок завершился. Код никто не забирает, запись остаётся: состояние Z, пометка <defunct>.', n=[('lab-parent', 4306, 3537, 'S'), ('sleep', 4307, 4306, 'Z')], term='4307  4306 Z  [sleep] <defunct>'),
        dict(t='KILL зомби ничего не меняет', p='Процесса уже нет, сигнал доставлять некому. Запись на месте.', n=[('lab-parent', 4306, 3537, 'S'), ('sleep', 4307, 4306, 'Z')], term='$ kill -9 4307\n4307  4306 Z  [sleep] <defunct>'),
    ]),
    dict(title='Родитель завершается', steps=[
        dict(t='Зомби у родителя', p='lab-parent не забирает код своего потомка.', n=[('lab-parent', 4306, 3537, 'S'), ('sleep', 4307, 4306, 'Z')], term=''),
        dict(t='Родитель снят TERM', p='Без родителя зомби становится сиротой. Его усыновляет PID 1 или процесс-приёмник сеанса.', n=[('systemd', 1, 0, 'S'), ('sleep', 4307, 1, 'Z')], term='$ kill 4306'),
        dict(t='Новый родитель забирает код', p='Приёмник сразу вызывает wait: запись удалена, PID 4307 освобождён.', n=[('systemd', 1, 0, 'S')], term='$ ps --ppid 4306\n  PID  PPID STAT CMD'),
    ]),
]


def player(kind, title, cases):
    tabs = ''.join(f'<button type="button" data-case="{i}" aria-pressed="{str(i == 0).lower()}">{E(c["title"])}</button>' for i, c in enumerate(cases)) if len(cases) > 1 else ''
    return (f'<div class="model player" data-widget="player" data-cases="{E(json.dumps(cases, ensure_ascii=False))}">'
            f'<div class="model-head"><span>Схема · {E(title)}</span><div class="pl-cases" role="group" aria-label="Сценарий">{tabs}</div></div>'
            '<div class="pl-body"><ol class="pl-steps"></ol><div class="pl-stage"><div class="pl-tree" aria-live="polite"></div><p class="pl-text"></p><pre class="pl-term"></pre>'
            '<div class="pl-nav"><button type="button" data-go="-1">← Назад</button><span class="pl-count"></span><button type="button" data-go="1">Дальше →</button></div></div></div></div>')


def w_fork(): return player('fork', 'как оболочка запускает команду', FORK)
def w_reap(): return player('reap', 'что происходит с завершившимся процессом', REAP)


STATES = {
    'NEW': ('создание', 'Процесс появляется после fork родителя.', [], ['R: сразу становится готовым к выполнению']),
    'R': ('выполняется', 'Работает на процессоре или стоит к нему в очереди.', ['создан вызовом fork', 'S: наступило событие или пришёл сигнал', 'D: устройство ответило', 'T: пришёл сигнал CONT'],
          ['S: ждёт события — ввода, таймера, данных из сети', 'D: ждёт завершения ввода-вывода', 'T: сигнал STOP или Ctrl+Z', 'Z: завершился — вызов exit или сигнал завершения']),
    'S': ('спит', 'Ждёт события и процессор не занимает. Так большую часть времени живут почти все процессы.', ['R: начал ждать событие'], ['R: событие наступило или пришёл сигнал']),
    'D': ('ждёт устройство', 'Ждёт окончания ввода-вывода и сигналы до его конца не обрабатывает — даже KILL подействует только после.', ['R: обратился к диску или сетевой файловой системе'], ['R: устройство ответило']),
    'T': ('остановлен', 'Приостановлен и ждёт команды продолжить; работа не потеряна.', ['R: сигнал STOP, Ctrl+Z — TSTP'], ['R: сигнал CONT, команды fg и bg']),
    'Z': ('зомби', 'Уже завершился; в таблице осталась запись с кодом завершения.', ['R: вызвал exit или снят сигналом'], ['удалён: родитель прочитал код вызовом wait']),
    'GONE': ('удалён', 'Записи больше нет, PID свободен и может достаться новому процессу.', ['Z: родитель или PID 1 вызвал wait'], []),
}
POS = {'NEW': (70, 150), 'R': (230, 150), 'S': (230, 40), 'D': (230, 260), 'T': (430, 40), 'Z': (430, 260), 'GONE': (590, 260)}
EDGES = [('NEW', 'R', 'fork'), ('R', 'S', 'ждёт'), ('S', 'R', 'событие'), ('R', 'D', 'ввод-вывод'), ('D', 'R', 'готово'),
         ('R', 'T', 'STOP'), ('T', 'R', 'CONT'), ('R', 'Z', 'exit'), ('Z', 'GONE', 'wait')]


def w_states():
    import math
    svg = ['<svg viewBox="0 0 660 300" class="st-svg" role="img" aria-label="Переходы между состояниями процесса">',
           '<defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>']
    for a, b, label in EDGES:
        (x1, y1), (x2, y2) = POS[a], POS[b]
        dx, dy = x2 - x1, y2 - y1; d = math.hypot(dx, dy); ux, uy = dx / d, dy / d
        off = 9 if any(e[0] == b and e[1] == a for e in EDGES) else 0
        ox, oy = -uy * off, ux * off
        sx, sy, ex, ey = x1 + ux * 34 + ox, y1 + uy * 34 + oy, x2 - ux * 36 + ox, y2 - uy * 36 + oy
        mx, my = (sx + ex) / 2, (sy + ey) / 2
        if abs(uy) > 0.8:                      # вертикальная стрелка: подпись сбоку
            anchor = 'start' if ox > 0 else 'end'
            mx += 8 if ox > 0 else -8; my += 4
        else:
            anchor = 'middle'; mx += ox * 1.6; my += oy * 1.6 - 4
        svg.append(f'<g class="st-edge" data-from="{a}" data-to="{b}"><line x1="{sx:.0f}" y1="{sy:.0f}" x2="{ex:.0f}" y2="{ey:.0f}" marker-end="url(#ah)"/>'
                   f'<text x="{mx:.0f}" y="{my:.0f}" text-anchor="{anchor}">{E(label)}</text></g>')
    for k, (x, y) in POS.items():
        name = STATES[k][0]
        letter = k if len(k) == 1 else ''
        svg.append(f'<g class="st-node" data-st="{k}" tabindex="0" role="button" aria-label="{E(name)}"><circle cx="{x}" cy="{y}" r="34"/>'
                   f'<text x="{x}" y="{y - 2 if letter else y + 4}" class="st-l">{letter or "•"}</text><text x="{x}" y="{y + 16}" class="st-n">{E(name)}</text></g>')
    svg.append('</svg>')
    data = json.dumps({k: dict(name=v[0], text=v[1], into=v[2], out=v[3]) for k, v in STATES.items()}, ensure_ascii=False)
    return ('<div class="model states" data-widget="states" data-states="' + E(data) + '">'
            '<div class="model-head"><span>Схема · переходы между состояниями</span></div>'
            + ''.join(svg) + '<div class="st-info" aria-live="polite"></div></div>')


WIDGETS = dict(fork=w_fork, reap=w_reap, states=w_states)
