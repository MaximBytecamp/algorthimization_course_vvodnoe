"""Собирает справочник «Стандарты и сертификаты»: обложку и страницы глав.

    python3 _src/shots.py     # кадры: настоящие страницы и образцы документов
    python3 _src/build.py

Оформление общее со справочником «Вайбкодинг в России»: styles.css и book.js копируются оттуда.
"""
import html, pathlib, re, shutil
from chapters import CHAPTERS as BASE
from chapters_code import PEP8, DOCS, VERSIONS
from chapters_more import DATA, CODES, A11Y, TESTS, EDOC, REGS

_b = {c["slug"].split("-", 1)[1]: c for c in BASE}
ORDER = [_b["chto-takoe-standart"], _b["gost-34-i-gost-19"], _b["oformlenie-dokumentov"], _b["standarty-interneta"],
         PEP8, DOCS, VERSIONS, DATA, CODES, A11Y, TESTS,
         _b["informacionnaya-bezopasnost"], _b["kriptografiya-i-sertifikaty-klyuchej"], _b["kachestvo-i-processy"],
         EDOC, REGS, _b["sertifikaciya-i-deklarirovanie"]]
CHAPTERS = []
for _n, _c in enumerate(ORDER, 1):      # номер главы и адрес зависят только от места в оглавлении
    CHAPTERS.append(dict(_c, num=str(_n), slug=f"{_n}-" + _c["slug"].split("-", 1)[1]))

ROOT = pathlib.Path(__file__).resolve().parent.parent
PRAVO = ROOT.parent / "spravochnik-pravo"
BOOK = "Стандарты и сертификаты"
FONTS = ('<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
         '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Literata:opsz,wght@7..72,400;7..72,600;7..72,700'
         '&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">')


def nb(text):
    """Неразрывные пробелы: в числах с разрядами, перед единицами и после коротких предлогов."""
    text = re.sub(r"(?<=\d) (?=\d{3}\b)", "\u00a0", text)
    text = re.sub(r"(\d) (мм|бит|бита|минут|минуты|часов|часа|суток|секунд|символов|пробела|пробелов|%|г\.|года|году)\b", "\\1\u00a0\\2", text)
    return re.sub(r"(?<![\w>])(в|к|с|о|и|а|на|по|от|до|из|за|не|ст\.|№|ч\.|п\.) (?=[\w«<])", "\\1\u00a0", text)


def block(b):
    if isinstance(b, str):
        return f"<p>{nb(b)}</p>"
    kind = b[0]
    if kind == "table":
        head = "".join(f"<th>{nb(h)}</th>" for h in b[1])
        rows = "".join("<tr>" + "".join(f"<td>{nb(c)}</td>" for c in r) + "</tr>" for r in b[2])
        return f'<div class="table-scroll"><table>\n<thead><tr>{head}</tr></thead>\n<tbody>\n{rows}\n</tbody></table></div>'
    if kind == "shot":
        assert (ROOT / "shots" / b[1]).exists(), f"нет кадра {b[1]}"
        return (f'<figure class="shot"><img src="../../shots/{b[1]}" alt="{html.escape(b[2])}" loading="lazy">'
                f'<figcaption><b>{nb(b[2])}</b> {nb(b[3])}</figcaption></figure>')
    if kind == "levels":
        return '<div class="levels">\n' + "\n".join(
            f"<div><small>{s}</small><b>{nb(t)}</b><ul>" + "".join(f"<li>{nb(x)}</li>" for x in items) + "</ul></div>" for s, t, items in b[1]) + "\n</div>"
    if kind == "case":
        return (f'<div class="case">\n<header><small>Случай</small>{nb(b[1])}</header>\n' + "\n".join(
            f"<div><b>{t}</b><ul>" + "".join(f"<li>{nb(x)}</li>" for x in items) + "</ul></div>" for t, items in b[2]) + "\n</div>")
    if kind == "pair":
        return (f'<div class="pair"><p class="pair__title">{nb(b[1])}</p><div class="pair__cols">'
                f'<div class="code code--bad"><b>так не надо</b><pre>{html.escape(b[2])}</pre></div>'
                f'<div class="code code--good"><b>так надо</b><pre>{html.escape(b[3])}</pre></div></div>'
                f'<p class="pair__note">{nb(b[4])}</p></div>')
    if kind == "code":
        return f'<div class="code"><b>{b[1]}</b><pre>{html.escape(b[2])}</pre></div>'
    raise ValueError(kind)


def head(title, desc, depth):
    up = "../" * depth
    return (f'<!doctype html>\n<html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
            f'<meta name="theme-color" content="#f6f4ee">\n<meta name="description" content="{html.escape(desc)}">\n<title>{title}</title>\n{FONTS}\n'
            f'<link rel="stylesheet" href="{up}styles.css"><link rel="stylesheet" href="{up}extra.css"><script defer src="{up}book.js"></script></head>\n')


def chapter(ch, prev, nxt):
    plain = ch["title"].replace("<br>", " ")
    secs = list(ch["secs"])
    n_m, n_c = len(secs) + 1, len(secs) + 2
    toc = "".join(f'<li><a href="#s{i}">{t}</a></li>' for i, (t, _) in enumerate(secs, 1)) + \
        f'<li><a href="#s{n_m}">Частые ошибки</a></li><li><a href="#s{n_c}">Проверьте себя</a></li>'
    body = "\n\n".join(f'<section class="sec" id="s{i}">\n<h2><i>§{i}</i>{t}</h2>\n' + "\n".join(block(b) for b in blocks) + "\n</section>"
                       for i, (t, blocks) in enumerate(secs, 1))
    passport = "".join(f"<div><dt>{k}</dt><dd>{nb(v)}</dd></div>" for k, v in ch["passport"])
    mistakes = "\n".join(f"<div><b>{nb(b)}</b>{nb(t)}</div>" for b, t in ch["mistakes"])
    check = "\n".join(f"<li>{nb(q)}</li>" for q in ch["check"])
    cheat = "\n".join(f"<div><b>{t}</b>" + "".join(f"<code>{c}</code>" for c in codes) + "</div>" for t, codes in ch["cheat"])
    nav = (f'<a href="../{prev["slug"]}/index.html">← Глава {prev["num"]}. {prev["short"]}</a>' if prev else '<a href="../../index.html">← К оглавлению</a>') + \
          (f'<a href="../{nxt["slug"]}/index.html">Глава {nxt["num"]}. {nxt["short"]} →</a>' if nxt else '<a href="../../index.html">К оглавлению →</a>')
    return head(f'{ch["num"]}. {plain} · {BOOK}', ch["card"], 2) + f'''<body><a class="skip" href="#s1">К тексту главы</a>
<div class="book"><div class="book__body">
<div class="spine"><span>{BOOK} · тема 3</span></div>
<main class="leaf">
<div class="running"><p class="eyebrow"><a href="../../index.html">Справочник «{BOOK}»</a> · тема 3</p><p class="folio">Глава {ch["num"]}</p></div>

<header class="chapter-head">
<span class="chapter-num">{ch["num"]}</span>
<h1>{ch["title"]}</h1>
<p class="lead">{nb(ch["lead"])}</p>
</header>

<dl class="passport">{passport}</dl>

<nav class="contents"><b>В этой главе</b>
<ol>{toc}</ol>
</nav>

{body}

<section class="wrapup">
<section class="sec" id="s{n_m}">
<h2><i>§{n_m}</i>Частые ошибки</h2>
<div class="mistakes">
{mistakes}
</div>
</section>

<section class="sec" id="s{n_c}">
<h2><i>§{n_c}</i>Проверьте себя</h2>
<ol class="check">
{check}
</ol>
<div class="cheat">
{cheat}
</div>
</section>

<nav class="chapter-nav">{nav}</nav>
</section>

<p class="foot"><span>Справочник «{BOOK}» · глава {ch["num"]}</span><span>Макаров Максим Николаевич</span></p>
</main>
</div></div>
<dialog id="zoom"><div class="bar"><span>Кадр</span><button type="button">Закрыть ✕</button></div><img alt=""></dialog>
</body></html>
'''


def cover():
    items = "".join(f'<li><a href="temy/{c["slug"]}/index.html"><b>{c["num"]}</b><span><i>{c["short"]}</i><span>{nb(c["card"])}</span></span></a></li>' for c in CHAPTERS)
    shots = sum(1 for c in CHAPTERS for _, bl in c["secs"] for b in bl if not isinstance(b, str) and b[0] == "shot")
    return head(f"Справочник «{BOOK}»", "Справочник по стандартам и сертификатам для разработчика: виды стандартов, ГОСТ 34 и ГОСТ 19, оформление документов, "
                "стандарты интернета и кода, информационная безопасность, криптография, качество, сертификация.", 0) + f'''<body><a class="skip" href="#modules">К главам</a>
<div class="book"><div class="book__body">
<div class="spine"><span>{BOOK} · 4 курс</span></div>
<main class="leaf cover">
<div class="running"><p class="eyebrow"><a href="../index.html">Стандартизация, сертификация и техническое документоведение</a> · тема 3</p><p class="folio">Справочник</p></div>

<header class="chapter-head">
<span class="chapter-num">ГОСТ · ISO · RFC</span>
<h1>Стандарты<br>и сертификаты</h1>
<p class="lead">{nb("Разработчик встречает стандарты в договоре, в техническом задании, в журнале сервера и в документации к библиотекам. Справочник разбирает их по группам: что описывает каждый документ, кто его принял, как он выглядит и где его проверить. В каждой главе — снимки настоящих страниц стандартов и реестров и образцы документов.")}</p>
</header>

<dl class="passport">
<div><dt>Дисциплина</dt><dd>Стандартизация, сертификация и техническое документоведение, 4 курс</dd></div>
<div><dt>Состав</dt><dd>{len(CHAPTERS)} глав, {shots} кадров и образцов</dd></div>
<div><dt>Кадры сняты</dt><dd>7 октября 2026 года</dd></div>
<div><dt>Где пригодится</dt><dd>Замки в игре-расследовании «Выгрузка на продажу» построены на этих стандартах</dd></div>
</dl>

<section class="sec" id="modules">
<h2><i>§1</i>Главы</h2>
<div class="modules">
<article class="module">
<header><b>Тема 3</b><h2>Стандарты и сертификаты</h2><span>{len(CHAPTERS)} глав</span></header>
<ol>{items}</ol>
</article>
</div>
</section>

<p class="foot"><span>Справочник «{BOOK}»</span><span>Макаров Максим Николаевич</span></p>
</main>
</div></div>
</body></html>
'''


def main():
    for name in ("styles.css", "book.js"):
        shutil.copy(PRAVO / name, ROOT / name)
    for old in (ROOT / "temy").glob("*"):
        shutil.rmtree(old)
    for i, ch in enumerate(CHAPTERS):
        out = ROOT / "temy" / ch["slug"]
        out.mkdir(parents=True, exist_ok=True)
        (out / "index.html").write_text(chapter(ch, CHAPTERS[i - 1] if i else None, CHAPTERS[i + 1] if i + 1 < len(CHAPTERS) else None))
    (ROOT / "index.html").write_text(cover())
    print("глав:", len(CHAPTERS))


if __name__ == "__main__":
    main()
