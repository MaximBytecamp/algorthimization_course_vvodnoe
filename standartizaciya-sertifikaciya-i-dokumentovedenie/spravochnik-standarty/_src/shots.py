"""Кадры для справочника «Стандарты и сертификаты»: настоящие страницы и образцы документов.

    python3 _src/shots.py [web] [docs]
"""
import html, pathlib, sys
from playwright.sync_api import sync_playwright

OUT = pathlib.Path(__file__).resolve().parent.parent / "shots"
WEB = {
    "pep8": "https://peps.python.org/pep-0008/", "pep257": "https://peps.python.org/pep-0257/",
    "rfc9110": "https://www.rfc-editor.org/rfc/rfc9110.html", "rfc8259": "https://datatracker.ietf.org/doc/html/rfc8259",
    "rfc8446": "https://www.rfc-editor.org/rfc/rfc8446.html", "semver": "https://semver.org/lang/ru/",
    "openapi": "https://spec.openapis.org/oas/v3.1.0.html", "iso27001": "https://www.iso.org/standard/27001",
    "iso8601": "https://www.iso.org/iso-8601-date-and-time-format.html", "iso9001": "https://www.iso.org/standard/62085.html",
    "owasp": "https://owasp.org/Top10/", "cve": "https://nvd.nist.gov/vuln/detail/CVE-2021-44228",
    "pci": "https://www.pcisecuritystandards.org/standards/", "fsa": "https://pub.fsa.gov.ru/rss/certificate",
    "rst": "https://www.rst.gov.ru/portal/gost/home/standarts/catalognational", "gost34602": "https://docs.cntd.ru/document/1200181804",
    "unicode": "https://home.unicode.org/", "pep484": "https://peps.python.org/pep-0484/", "pep20": "https://peps.python.org/pep-0020/",
    "conventionalcommits": "https://www.conventionalcommits.org/ru/v1.0.0/", "keepachangelog": "https://keepachangelog.com/ru/1.1.0/",
    "spdx": "https://spdx.org/licenses/", "jsonschema": "https://json-schema.org/", "iso3166": "https://www.iso.org/iso-3166-country-codes.html",
    "wcag": "https://w3c.github.io/wcag/guidelines/22/", "fstec": "https://reestr.fstec.ru/reg3", "bdu": "https://bdu.fstec.ru/vul",
}
CSS = """body{margin:0;background:#8d8a82;font-family:'Times New Roman',Times,serif}.desk{padding:26px 30px;width:1000px;box-sizing:border-box}
.page{position:relative;background:#fbf8ee;padding:60px 70px 70px;box-shadow:0 6px 22px rgba(0,0,0,.45);min-height:1100px;box-sizing:border-box;font-size:19px;line-height:1.5;color:#1d1b18}
.c{text-align:center}.r{text-align:right}.b{font-weight:700}.sp{height:18px}.u{letter-spacing:3px}
.n{display:inline-grid;place-items:center;width:26px;height:26px;border-radius:50%;background:#2d7fc1;color:#fff;font:700 14px Helvetica,Arial,sans-serif;margin-right:8px;vertical-align:2px}
.wm{position:absolute;left:0;right:0;top:44%;text-align:center;font:800 120px Helvetica,Arial,sans-serif;color:rgba(174,61,55,.13);transform:rotate(-24deg)}
.frame{border:6px double #24774d;padding:40px 46px;min-height:960px}.row{display:grid;grid-template-columns:260px 1fr;gap:14px;margin:9px 0;font-size:17px}
.row span{color:#555;font:600 13px Helvetica,Arial,sans-serif;text-transform:uppercase;letter-spacing:.05em}.stamp{position:absolute;right:110px;bottom:80px;width:170px;height:170px;border:5px solid #2b3f9e;border-radius:50%;display:grid;place-items:center;color:#2b3f9e;font:700 14px Helvetica;text-align:center;transform:rotate(-12deg);opacity:.7}
.info{font-family:Helvetica,Arial,sans-serif;background:#fff;padding:44px 50px;width:1000px;box-sizing:border-box;color:#020835}
.info h1{font-size:26px;margin:0 0 26px}.parts{display:flex;gap:10px;align-items:flex-start;margin:0 0 40px}
.part{border:3px solid #020835;padding:14px 18px;text-align:center;box-shadow:5px 5px 0 #020835}.part b{display:block;font:800 36px 'Courier New',monospace}.part small{display:block;margin-top:8px;font-size:14px;color:#5a6183;max-width:200px}
.part.a{background:#DCEBF8}.part.b{background:#FBEED6}.part.c{background:#DCEFE4}.part.d{background:#F9E3E1}
.cert{font-family:Helvetica,Arial,sans-serif;background:#f3f4f8;width:760px;padding:26px;box-sizing:border-box}.cw{background:#fff;border:1px solid #c7cbd5;border-radius:10px;overflow:hidden}
.ch{background:#eef1f7;padding:14px 18px;font-weight:700;border-bottom:1px solid #c7cbd5}.cr{display:grid;grid-template-columns:230px 1fr;gap:10px;padding:10px 18px;border-bottom:1px solid #eceef3;font-size:15px}.cr span{color:#5a6183}"""


def doc(body, cls="desk"):
    return f"<!doctype html><meta charset='utf-8'><style>{CSS}</style><div class='{cls}'>{body}</div>"


DOCS = {
    "prikaz": doc("""<div class='page'>
<p class='c b'><span class='n'>1</span>Общество с ограниченной ответственностью «КурсБлиновской»<br>(ООО «КурсБлиновской»)</p><div class='sp'></div>
<p class='c b u'><span class='n'>2</span>ПРИКАЗ</p><div class='sp'></div>
<p><span class='n'>3</span>02.02.2026 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class='n'>4</span>№ 3</p>
<p class='c'><span class='n'>5</span>Москва</p><div class='sp'></div>
<p class='b'><span class='n'>6</span>О назначении ответственного<br>за организацию обработки<br>персональных данных</p><div class='sp'></div>
<p><span class='n'>7</span>В соответствии со статьёй 22.1 Федерального закона от 27.07.2006 № 152-ФЗ «О персональных данных»</p>
<p>ПРИКАЗЫВАЮ:</p>
<p>1. Назначить ответственным за организацию обработки персональных данных генерального директора Гранина О. В.</p>
<p>2. Техническому директору Корнееву Д. А. в срок до 16.02.2026 представить перечень информационных систем, в которых обрабатываются персональные данные.</p>
<p>3. Контроль за исполнением приказа оставляю за собой.</p><div class='sp'></div><div class='sp'></div>
<p><span class='n'>8</span>Генеральный директор &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<i>Гранин</i> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;О. В. Гранин</p><div class='sp'></div><div class='sp'></div>
<p><span class='n'>9</span>С приказом ознакомлен:<br>Технический директор &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<i>Корнеев</i> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Д. А. Корнеев &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;03.02.2026</p></div>"""),
    "tz": doc("""<div class='page'><p class='r'>УТВЕРЖДАЮ<br>Директор школы «Сто баллов»<br>__________ / ___________ /<br>«___» __________ 2026 г.</p><div class='sp'></div><div class='sp'></div>
<p class='c b' style='font-size:24px'>Электронный журнал занятий школы «Сто баллов»</p><div class='sp'></div>
<p class='c b u'>ТЕХНИЧЕСКОЕ ЗАДАНИЕ</p><p class='c'>на создание автоматизированной системы</p><p class='c'>На 24 листах</p><p class='c'>Действует с 01.11.2026</p><div class='sp'></div><div class='sp'></div>
<p class='b'>Содержание</p>
<p>1. Общие сведения<br>2. Цели и назначение создания автоматизированной системы<br>3. Характеристика объектов автоматизации<br>4. Требования к автоматизированной системе<br>5. Состав и содержание работ по созданию автоматизированной системы<br>6. Порядок разработки автоматизированной системы<br>7. Порядок контроля и приёмки автоматизированной системы<br>8. Требования к составу и содержанию работ по подготовке объекта автоматизации к вводу автоматизированной системы в действие<br>9. Требования к документированию<br>10. Источники разработки</p>
<div class='sp'></div><p class='c' style='position:absolute;left:0;right:0;bottom:50px'>Москва, 2026</p></div>"""),
    "sertifikat": doc("""<div class='page'><div class='wm'>ОБРАЗЕЦ</div><div class='frame'>
<p class='c b' style='font:700 15px Helvetica'>СИСТЕМА ДОБРОВОЛЬНОЙ СЕРТИФИКАЦИИ «ИНФОСТАНДАРТ»</p><div class='sp'></div>
<p class='c b' style='font-size:34px;letter-spacing:2px'>СЕРТИФИКАТ СООТВЕТСТВИЯ</p><p class='c'>№ РОСС RU.ИС00.Н00417</p><div class='sp'></div>
<div class='row'><span>Срок действия</span><div>с 12.03.2026 по 11.03.2029</div></div>
<div class='row'><span>Орган по сертификации</span><div>ООО «Центр оценки соответствия», аттестат аккредитации № RA.RU.11ИС00 от 04.09.2024</div></div>
<div class='row'><span>Объект сертификации</span><div>Система менеджмента информационной безопасности применительно к разработке и сопровождению платформы онлайн-курсов</div></div>
<div class='row'><span>Заявитель</span><div>ООО «Пример», 101000, г. Москва, ул. Образцовая, д. 1, ОГРН 0000000000000</div></div>
<div class='row'><span>Соответствует требованиям</span><div>ГОСТ Р ИСО/МЭК 27001-2021 «Информационная технология. Методы и средства обеспечения безопасности. Системы менеджмента информационной безопасности. Требования»</div></div>
<div class='row'><span>Основание</span><div>Отчёт об аудите № 26-041 от 02.03.2026, решение комиссии № 17 от 10.03.2026</div></div>
<div class='row'><span>Инспекционный контроль</span><div>ежегодно, не позднее 11.03.2027 и 11.03.2028</div></div>
<div class='sp'></div><p>Руководитель органа &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;__________ &nbsp;&nbsp;&nbsp;&nbsp;Эксперт &nbsp;&nbsp;&nbsp;&nbsp;__________</p></div><div class='stamp'>ОРГАН ПО<br>СЕРТИФИКАЦИИ<br>М. П.</div></div>"""),
    "oboznachenie": doc("""<h1>Как читается обозначение стандарта</h1>
<div class='parts'><div class='part a'><b>ГОСТ Р</b><small>вид: национальный стандарт России</small></div><div class='part b'><b>7.0.97</b><small>номер: система 7 (СИБИД), порядковый номер внутри неё</small></div><div class='part c'><b>2016</b><small>год утверждения</small></div></div>
<div class='parts'><div class='part a'><b>ISO/IEC</b><small>кто принял: ИСО совместно с МЭК</small></div><div class='part b'><b>27001</b><small>номер стандарта в серии 27000</small></div><div class='part c'><b>2022</b><small>год редакции, пишется через двоеточие</small></div></div>
<div class='parts'><div class='part a'><b>ГОСТ Р ИСО/МЭК</b><small>национальный стандарт, принятый на основе международного</small></div><div class='part b'><b>27001</b><small>номер исходного стандарта сохраняется</small></div><div class='part c'><b>2021</b><small>год принятия в России; год исходной редакции здесь не указан</small></div></div>
<div class='parts'><div class='part d'><b>RFC</b><small>серия документов Инженерного совета Интернета</small></div><div class='part b'><b>9110</b><small>сквозной номер; новая редакция получает новый номер</small></div></div>""", "info"),
    "semver": doc("""<h1>Номер версии по Semantic Versioning</h1>
<div class='parts'><div class='part d'><b>2</b><small>MAJOR: меняется, когда изменения несовместимы с прежним интерфейсом</small></div><div class='part b'><b>4</b><small>MINOR: добавлены возможности, старое продолжает работать</small></div><div class='part c'><b>1</b><small>PATCH: исправлены ошибки, интерфейс не менялся</small></div></div>
<div class='parts'><div class='part a'><b>2.4.1 → 2.4.2</b><small>исправили ошибку в расчёте</small></div><div class='part a'><b>2.4.2 → 2.5.0</b><small>добавили необязательный параметр</small></div><div class='part a'><b>2.5.0 → 3.0.0</b><small>убрали поле из ответа</small></div></div>""", "info"),
    "x509": doc("""<div class='cw'><div class='ch'>Сведения о сертификате · kursblinovskoy.example</div>
<div class='cr'><span>Кому выдан (Subject)</span><b>CN = kursblinovskoy.example</b></div><div class='cr'><span>Кем выдан (Issuer)</span><div>CN = R11, O = Let's Encrypt, C = US</div></div>
<div class='cr'><span>Действителен с</span><div>01.09.2026 03:12:40 UTC</div></div><div class='cr'><span>Действителен по</span><div>30.11.2026 03:12:39 UTC</div></div>
<div class='cr'><span>Серийный номер</span><div>04:9A:2F:7C:51:E0:3B:66:18:D2:AA:07:C4:5E:90:1B:3F:22</div></div>
<div class='cr'><span>Алгоритм подписи</span><div>ECDSA с SHA-384</div></div><div class='cr'><span>Открытый ключ</span><div>ECDSA, кривая P-256</div></div>
<div class='cr'><span>Альтернативные имена</span><div>kursblinovskoy.example, www.kursblinovskoy.example</div></div>
<div class='cr'><span>Цепочка</span><div>ISRG Root X1 → R11 → kursblinovskoy.example</div></div><div class='cr'><span>Версия</span><div>X.509 v3</div></div></div>""", "cert"),
}


T = "font-family:Menlo,Consolas,monospace;font-size:15px;line-height:1.6"
def _lint_output():
    """Настоящий вывод pycodestyle и ruff для файла «до» из главы о PEP 8."""
    import subprocess, tempfile
    from chapters_code import PEP8
    code = next(b[2] for _, bl in PEP8["secs"] for b in bl if isinstance(b, tuple) and b[0] == "code" and b[1] == "до: report.py")
    tmp = pathlib.Path(tempfile.mkdtemp()) / "report.py"
    tmp.write_text(code + "\n")
    run = lambda *cmd: subprocess.run(cmd, capture_output=True, text=True, cwd=tmp.parent).stdout.strip().splitlines()
    return (run("pycodestyle", "report.py")[:9],
            run("ruff", "check", "report.py", "--select", "E,W,F", "--line-length", "79", "--output-format", "concise", "--no-cache"))


def _term(lines):
    out = []
    for ln in lines:
        if ln.startswith("$"):
            out.append(f"<div style='color:#7FD69B;margin-top:10px'>{html.escape(ln)}</div>")
        elif ln.startswith("report.py:"):
            loc, rest = ln.split(" ", 1)
            code, msg = (rest.split(" ", 1) + [""])[:2]
            out.append(f"<div><span style='color:#7FB4E3'>{html.escape(loc)}</span> <b style='color:#ff9b8f'>{html.escape(code)}</b> {html.escape(msg)}</div>")
        else:
            out.append(f"<div>{html.escape(ln)}</div>")
    return "".join(out)


_pcs, _ruff = _lint_output()
DOCS["ruff"] = (f"<!doctype html><meta charset='utf-8'><body style='margin:0;width:900px;background:#0C1230;color:#EDF1FA;{T};padding:8px 22px 18px;box-sizing:border-box'>"
                + _term(["$ pycodestyle report.py"] + _pcs + ["… и ещё строки"] + ["$ ruff check report.py --select E,W,F"] + _ruff) + "</body>")
DOCS["contrast"] = ("<!doctype html><meta charset='utf-8'><body style='margin:0;width:900px;background:#fff;font-family:Helvetica,Arial,sans-serif;padding:24px;box-sizing:border-box'>"
    + "".join(f"<div style='display:flex;align-items:center;gap:16px;margin:10px 0'><div style='flex:1;background:{bg};color:{fg};padding:16px 18px;font-size:18px'>"
              f"Записаться на курс «Python с нуля»</div><div style='width:220px;font:600 15px Menlo,monospace;color:{mc}'>{r} · {v}</div></div>"
              for bg, fg, r, v, mc in [("#ffffff", "#bbbbbb", "1,9:1", "не проходит", "#ae3d37"), ("#ffffff", "#959595", "3,0:1", "только крупный текст", "#a3650d"),
                                       ("#ffffff", "#767676", "4,5:1", "AA пройден", "#24774d"), ("#0E7C66", "#ffffff", "5,1:1", "AA пройден", "#24774d"),
                                       ("#FF6B3D", "#ffffff", "2,8:1", "не проходит", "#ae3d37")]) + "</body>")
DOCS["units"] = doc("""<h1>Десятичные и двоичные приставки</h1>
<div class='parts'><div class='part a'><b>1 кБ</b><small>килобайт = 1000 байт (SI)</small></div><div class='part a'><b>1 МБ</b><small>мегабайт = 1 000 000 байт</small></div><div class='part a'><b>1 ГБ</b><small>гигабайт = 10<sup>9</sup> байт</small></div></div>
<div class='parts'><div class='part c'><b>1 КиБ</b><small>кибибайт = 1024 байт (IEC 80000-13)</small></div><div class='part c'><b>1 МиБ</b><small>мебибайт = 1 048 576 байт</small></div><div class='part c'><b>1 ГиБ</b><small>гибибайт = 2<sup>30</sup> байт</small></div></div>
<div class='parts'><div class='part d'><b>1 ТБ ≈ 931 ГиБ</b><small>поэтому новый диск «на 1 ТБ» в системе выглядит меньше</small></div></div>""", "info")
DOCS["marks"] = ("<!doctype html><meta charset='utf-8'><body style='margin:0;width:900px;background:#2b2e36;font-family:Helvetica,Arial,sans-serif;padding:30px;box-sizing:border-box'>"
    "<div style='background:#1c1e24;border-radius:14px;padding:26px 30px;color:#cfd3dc;font-size:14px;line-height:1.6;box-shadow:inset 0 0 0 2px #3a3d46'>"
    "<div style='font-weight:700;font-size:16px;color:#fff'>Трекер «Рядом» · модель TR-2</div><div>Вход: 5 В ⎓ 1 А · Сделано в России · s/n 26100700417</div>"
    "<div style='display:flex;gap:34px;align-items:center;margin-top:22px'>"
    "<div style='font:800 54px/1 Helvetica;letter-spacing:-2px;color:#fff;border:0'>EAC</div>"
    "<div style='font:700 56px/1 Georgia,serif;color:#fff'>C&#8202;E</div>"
    "<div style='width:70px;height:70px;border:4px solid #fff;border-radius:50%;display:grid;place-items:center;font:800 18px Helvetica;color:#fff'>РСТ</div>"
    "<div style='font:800 40px/1 Helvetica;color:#fff;font-style:italic'>FCC</div>"
    "<div style='width:56px;height:68px;border:3px solid #fff;display:grid;place-items:center;color:#fff;font:700 12px Helvetica;text-align:center'>не в<br>мусор</div></div>"
    "<div style='margin-top:16px;font-size:12px;color:#8f97b8'>Образец. Изделие вымышленное. Знаки нанесены для иллюстрации.</div></div></body>")


def main():
    what = sys.argv[1:] or ["web", "docs"]
    OUT.mkdir(exist_ok=True)
    with sync_playwright() as pw:
        br = pw.chromium.launch()
        if "web" in what:
            ctx = br.new_context(viewport={"width": 1280, "height": 800}, locale="ru-RU", ignore_https_errors=True,
                                 user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0 Safari/537.36")
            for name, url in WEB.items():
                pg = ctx.new_page()
                try:
                    r = pg.goto(url, timeout=35000, wait_until="domcontentloaded")
                    pg.wait_for_timeout(2500)
                    for label in ("Refuse all", "Reject All", "Accept All", "Принять", "Согласен"):   # окна согласия на cookie
                        btn = pg.get_by_role("button", name=label)
                        if btn.count():
                            btn.first.click(timeout=2000)
                            pg.wait_for_timeout(900)
                            break
                    pg.screenshot(path=str(OUT / f"{name}.jpg"), type="jpeg", quality=72)
                    print(name, r.status if r else "?", pg.title()[:50])
                    if name == "gost34602":
                        text = pg.inner_text("body")
                        at = text.find("ТЗ на АС содержит")
                        print("   разделы ТЗ:", text[at:at + 900].replace("\n", " ") if at >= 0 else "не найдено")
                except Exception as e:
                    print(name, "ОШИБКА", str(e)[:70])
                pg.close()
        if "docs" in what:
            pg = br.new_page(viewport={"width": 1000, "height": 400}, device_scale_factor=1.3)
            for name, body in DOCS.items():
                pg.set_viewport_size({"width": 760 if name == "x509" else 900 if name in ("ruff", "contrast", "marks") else 1000, "height": 300})
                pg.set_content(body)
                pg.screenshot(path=str(OUT / f"doc-{name}.jpg"), full_page=True, type="jpeg", quality=72)
                print("образец:", name)
        br.close()


if __name__ == "__main__":
    main()
