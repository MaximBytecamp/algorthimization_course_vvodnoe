# Блоки текста урока. Используются в text_01.py … text_07.py (занятие 5).
#   P(html)                  — абзац
#   TERM(term, text, no='')  — определение: термин, объяснение, с чем не путать
#   STEPS(title, [html])     — порядок действий: пронумерованные шаги
#   PROBE(title, [(cmd, comment)], expect) — команды для терминала с пояснением к каждой;
#                              строка вида 'KEY:текст' — ввод с клавиатуры внутри команды (ответ y/n, поиск в man)
#   CORE(shot, caption, lens) — снимок экрана и увеличенный фрагмент с метками
#   W(name)                  — интерактивная схема из render.py
#   NOTE(html)               — чем ваш компьютер может отличаться от снимков
#   WARN(html)               — осторожно: действие, которое нельзя отменить
#   TABLE(head, rows)        — таблица
#   RAW(html)                — готовая разметка: схема команды в практической работе

def P(html): return ('p', html)
def TERM(term, text, no=''): return ('def', dict(term=term, text=text, no=no))
def STEPS(title, steps): return ('steps', dict(title=title, steps=steps))
def PROBE(title, lines, expect): return ('probe', dict(title=title, lines=lines, expect=expect))
def CORE(shot, caption, lens=None): return ('core', dict(shot=shot, caption=caption, lens=lens))
def W(name): return ('widget', name)
def NOTE(html): return ('note', html)
def WARN(html): return ('warn', html)
def TABLE(head, rows): return ('table', dict(head=head, rows=rows))
def RAW(html): return ('raw', html)

# Линза: строки терминала first..last (0 — верхняя строка окна), метки (строка, с колонки, по колонку, номер)
# и пояснения к номерам. Сетка снимков 1280×800: строка N занимает y = 80 + 22·N, колонка C — x = 67 + 10·C.
def LENS(first, last, marks, notes, cols=None): return dict(first=first, last=last, marks=marks, notes=notes, cols=cols)
