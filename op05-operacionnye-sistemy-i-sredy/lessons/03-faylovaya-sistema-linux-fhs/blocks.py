# Блоки текста урока. Используются в text_01.py … text_08.py.
#   P(html)                          — абзац; <mark> — маркер главного
#   D(term, tag, what, how, why, no)  — определение в виде страницы man
#   PROBE(title, [(cmd, comment)], expect) — команды для терминала с пояснением к каждой
#   CORE(shot, caption, lens)        — реальный кадр и увеличенный фрагмент с метками
#   ASK(question, answer)            — вопрос, ответ открывается после своего
#   W(name)                          — интерактивная модель из build.py
#   NOTE(html)                       — чем ваша машина может отличаться от кадров
#   TABLE(head, rows)                — таблица

def P(html): return ('p', html)
def D(term, tag, what, how, why, no=''): return ('def', dict(term=term, tag=tag, what=what, how=how, why=why, no=no))
def PROBE(title, lines, expect): return ('probe', dict(title=title, lines=lines, expect=expect))
def CORE(shot, caption, lens=None): return ('core', dict(shot=shot, caption=caption, lens=lens))
def ASK(q, a): return ('ask', dict(q=q, a=a))
def W(name): return ('widget', name)
def NOTE(html): return ('note', html)
def TABLE(head, rows): return ('table', dict(head=head, rows=rows))

# Линза: строки терминала first..last (0 — верхняя строка окна), метки (строка, с колонки, по колонку, номер)
# и пояснения к номерам. Сетка кадров 1280×800: строка N занимает y = 80 + 22·N, колонка C — x = 67 + 10·C.
def LENS(first, last, marks, notes, cols=None): return dict(first=first, last=last, marks=marks, notes=notes, cols=cols)
