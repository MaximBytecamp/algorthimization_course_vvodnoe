# Блоки текста урока. Используются в text_01.py … text_08.py.
#   P(html)                  — абзац
#   TERM(term, text, no='')  — определение: термин, объяснение, с чем не путать
#   PROBE(title, [(cmd, comment)], expect) — команды для терминала с пояснением к каждой
#   CORE(shot, caption, lens) — снимок экрана и увеличенный фрагмент с метками
#   W(name)                  — интерактивная схема из build.py
#   NOTE(html)               — чем ваш компьютер может отличаться от снимков
#   TABLE(head, rows)        — таблица

def P(html): return ('p', html)
def TERM(term, text, no=''): return ('def', dict(term=term, text=text, no=no))
def PROBE(title, lines, expect): return ('probe', dict(title=title, lines=lines, expect=expect))
def CORE(shot, caption, lens=None): return ('core', dict(shot=shot, caption=caption, lens=lens))
def W(name): return ('widget', name)
def NOTE(html): return ('note', html)
def TABLE(head, rows): return ('table', dict(head=head, rows=rows))

# Линза: строки терминала first..last (0 — верхняя строка окна), метки (строка, с колонки, по колонку, номер)
# и пояснения к номерам. Сетка снимков 1280×800: строка N занимает y = 80 + 22·N, колонка C — x = 67 + 10·C.
def LENS(first, last, marks, notes, cols=None): return dict(first=first, last=last, marks=marks, notes=notes, cols=cols)
