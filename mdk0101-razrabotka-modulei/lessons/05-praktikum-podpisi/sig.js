/* Разбор подписи функции и аннотаций типов в браузере.

   SIG.parseType(text)  → узел типа или SigError
   SIG.parseDef(text)   → { name, params: [{ name, type, def }], ret }
   SIG.canon(node)      → строка для сравнения: у объединения варианты
                          отсортированы, повторы убраны
   SIG.read(node)       → как тип читается по-русски

   Поддерживается то, что разобрано в главах 4.1–4.2: простые типы,
   list / dict / tuple / set с типом в скобках, объединение через |,
   классы date и Path. Ошибки записи описываются по-русски с местом. */
window.SIG = (() => {
  class SigError extends Error {
    constructor(msg, pos) { super(msg); this.pos = pos; }
  }

  const SIMPLE = ['int', 'float', 'str', 'bool', 'None', 'date', 'Path'];
  const GENERIC = { list: 1, set: 1, dict: 2, tuple: -1 };

  /* Частые описки и их объяснение. */
  const TYPO = {
    List: 'List с большой буквы — старая запись из модуля typing. В курсе пишется list[...]: импорт не нужен.',
    Dict: 'Dict с большой буквы — старая запись из модуля typing. В курсе пишется dict[...].',
    Tuple: 'Tuple с большой буквы — старая запись из модуля typing. В курсе пишется tuple[...].',
    Set: 'Set с большой буквы — старая запись из модуля typing. В курсе пишется set[...].',
    Optional: 'Optional — старая запись из модуля typing. В курсе «значение или None» пишется через черту: str | None.',
    Union: 'Union — старая запись из модуля typing. В курсе варианты перечисляются через черту: int | str.',
    Int: 'Имена встроенных типов пишутся с маленькой буквы: int.',
    Float: 'Имена встроенных типов пишутся с маленькой буквы: float.',
    Str: 'Имена встроенных типов пишутся с маленькой буквы: str.',
    Bool: 'Имена встроенных типов пишутся с маленькой буквы: bool.',
    none: 'None пишется с большой буквы.',
    string: 'Тип строки называется str.',
    integer: 'Тип целого числа называется int.',
    number: 'Для числа есть два типа: int — целое, float — дробное.',
    double: 'Дробное число в Python — float.',
    boolean: 'Тип «да или нет» называется bool.',
    array: 'Список в Python — list[...].',
    Date: 'Класс даты называется date, с маленькой буквы.',
    path: 'Класс пути называется Path, с большой буквы.',
  };

  /* ── Токены ── */
  const tokenize = text => {
    const out = [];
    let i = 0;
    while (i < text.length) {
      const ch = text[i];
      if (/\s/.test(ch)) { i++; continue; }
      if (/[A-Za-z_Ѐ-ӿ]/.test(ch)) {
        let j = i + 1;
        while (j < text.length && /[\wЀ-ӿ]/.test(text[j])) j++;
        out.push({ t: 'name', v: text.slice(i, j), pos: i });
        i = j; continue;
      }
      if (/[0-9]/.test(ch) || (ch === '-' && /[0-9]/.test(text[i + 1] || '') && text[i + 1] !== '>')) {
        let j = i + 1;
        while (j < text.length && /[0-9._]/.test(text[j])) j++;
        out.push({ t: 'num', v: text.slice(i, j), pos: i });
        i = j; continue;
      }
      if (ch === '"' || ch === "'") {
        const j = text.indexOf(ch, i + 1);
        if (j < 0) throw new SigError('Строка в кавычках не закрыта.', i);
        out.push({ t: 'str', v: text.slice(i + 1, j), pos: i });
        i = j + 1; continue;
      }
      if (text.startsWith('->', i)) { out.push({ t: 'op', v: '->', pos: i }); i += 2; continue; }
      if (text.startsWith('...', i)) { out.push({ t: 'op', v: '...', pos: i }); i += 3; continue; }
      if ('()[],:=|->'.includes(ch)) { out.push({ t: 'op', v: ch, pos: i }); i++; continue; }
      if (ch === '“' || ch === '”' || ch === '«' || ch === '»') throw new SigError('Кавычки должны быть прямыми: " или \'.', i);
      throw new SigError(`Символ «${ch}» в подписи не используется.`, i);
    }
    return out;
  };

  /* ── Типы ── */
  const parseTypeAt = (tk, i, end) => {
    const items = [];
    let node;
    ({ node, i } = parseAtom(tk, i, end));
    items.push(node);
    while (tk[i] && tk[i].v === '|') {
      if (!tk[i + 1] || ['|', ',', ']', ')', '=', ':'].includes(tk[i + 1].v)) throw new SigError('После | нужен ещё один тип.', tk[i].pos);
      ({ node, i } = parseAtom(tk, i + 1, end));
      items.push(node);
    }
    return { node: items.length > 1 ? { k: 'union', items } : items[0], i };
  };

  const parseAtom = (tk, i, end) => {
    const t = tk[i];
    if (!t) throw new SigError('Здесь должен быть тип.', end);
    if (t.t !== 'name') {
      if (t.v === '|') throw new SigError('Перед | нужен тип.', t.pos);
      if (t.v === '...') throw new SigError('Многоточие пишется только в tuple[тип, ...].', t.pos);
      throw new SigError('Здесь должен быть тип.', t.pos);
    }
    if (TYPO[t.v]) throw new SigError(TYPO[t.v], t.pos);
    const nxt = tk[i + 1];
    if (SIMPLE.includes(t.v)) {
      if (nxt && nxt.v === '[') throw new SigError(`У типа ${t.v} не бывает квадратных скобок.`, nxt.pos);
      return { node: { k: 'name', n: t.v }, i: i + 1 };
    }
    if (!(t.v in GENERIC)) throw new SigError(`Типа ${t.v} нет. Типы этой работы: int, float, str, bool, None, list, dict, tuple, set, date, Path.`, t.pos);
    if (!nxt || nxt.v !== '[') return { node: { k: 'name', n: t.v }, i: i + 1 };
    const args = [];
    let j = i + 2;
    if (tk[j] && tk[j].v === ']') throw new SigError(`В скобках после ${t.v} нужен тип.`, tk[j].pos);
    for (;;) {
      if (tk[j] && tk[j].v === '...') { args.push({ k: 'ell' }); j++; }
      else { const r = parseTypeAt(tk, j, end); args.push(r.node); j = r.i; }
      if (tk[j] && tk[j].v === ',') { j++; continue; }
      if (tk[j] && tk[j].v === ']') { j++; break; }
      throw new SigError(`Не закрыта квадратная скобка после ${t.v}.`, tk[j] ? tk[j].pos : end);
    }
    const n = GENERIC[t.v], open = nxt.pos;
    if (t.v === 'tuple') {
      const ell = args.findIndex(a => a.k === 'ell');
      if (ell >= 0 && !(args.length === 2 && ell === 1)) throw new SigError('Многоточие пишется только так: tuple[тип, ...].', open);
    } else {
      if (args.some(a => a.k === 'ell')) throw new SigError('Многоточие пишется только в tuple[тип, ...].', open);
      if (n === 1 && args.length !== 1) throw new SigError(`У ${t.v} в скобках один тип — тип элементов.`, open);
      if (n === 2 && args.length !== 2) throw new SigError('У dict в скобках два типа: ключа и значения — dict[str, int].', open);
    }
    return { node: { k: 'gen', n: t.v, args }, i: j };
  };

  const parseType = text => {
    const tk = tokenize(text);
    const { node, i } = parseTypeAt(tk, 0, text.length);
    if (i < tk.length) throw new SigError('Лишнее после типа.', tk[i].pos);
    return node;
  };

  const canon = node => {
    if (!node) return '';
    if (node.k === 'name') return node.n;
    if (node.k === 'ell') return '...';
    if (node.k === 'gen') return `${node.n}[${node.args.map(canon).join(', ')}]`;
    const parts = [...new Set(node.items.flatMap(x => (x.k === 'union' ? x.items : [x])).map(canon))];
    parts.sort((a, b) => (a === 'None') - (b === 'None') || a.localeCompare(b));
    return parts.join(' | ');
  };
  const canonText = text => canon(parseType(text));

  /* ── Подпись ── */
  const literal = t => {
    if (t.t === 'num') return t.v;
    if (t.t === 'str') return JSON.stringify(t.v);
    if (t.t === 'name' && ['None', 'True', 'False'].includes(t.v)) return t.v;
    if (t.t === 'name' && ['none', 'true', 'false'].includes(t.v)) throw new SigError(`${t.v} пишется с большой буквы: ${t.v[0].toUpperCase() + t.v.slice(1)}.`, t.pos);
    if (t.t === 'op' && t.v === '[') throw new SigError('Значение по умолчанию в этой работе — число, строка, True, False или None.', t.pos);
    throw new SigError('После = нужно значение по умолчанию: число, строка, True, False или None.', t.pos);
  };

  const parseDef = raw => {
    const text = raw.trim();
    if (!text) throw new SigError('Строка пуста.', 0);
    const tk = tokenize(text);
    const end = text.length;
    if (tk[0].v !== 'def') throw new SigError('Подпись начинается со слова def.', 0);
    if (!tk[1] || tk[1].t !== 'name') throw new SigError('После def нужно имя функции.', tk[1] ? tk[1].pos : end);
    if (!tk[2] || tk[2].v !== '(') throw new SigError('После имени функции нужна открывающая скобка (.', tk[2] ? tk[2].pos : end);
    const params = [];
    let i = 3;
    if (tk[i] && tk[i].v === ')') i++;
    else {
      for (;;) {
        const p = tk[i];
        if (!p) throw new SigError('Не хватает закрывающей скобки ).', end);
        if (p.t !== 'name') throw new SigError('Здесь должно быть имя параметра.', p.pos);
        const prm = { name: p.v, type: null, def: null, pos: p.pos };
        i++;
        if (tk[i] && tk[i].v === ':') {
          const r = parseTypeAt(tk, i + 1, end);
          prm.type = r.node; i = r.i;
        } else if (tk[i] && tk[i].t === 'name') {
          throw new SigError(`Между именем ${p.v} и типом нужно двоеточие: ${p.v}: ${tk[i].v}.`, tk[i].pos);
        }
        if (tk[i] && tk[i].v === '=') {
          if (!tk[i + 1]) throw new SigError('После = нужно значение по умолчанию.', end);
          prm.def = literal(tk[i + 1]); i += 2;
        }
        params.push(prm);
        if (tk[i] && tk[i].v === ',') { i++; if (tk[i] && tk[i].v === ')') { i++; break; } continue; }
        if (tk[i] && tk[i].v === ')') { i++; break; }
        if (!tk[i]) throw new SigError('Не хватает закрывающей скобки ).', end);
        if (tk[i].v === ']') throw new SigError('Лишняя квадратная скобка ].', tk[i].pos);
        throw new SigError('Параметры разделяются запятой.', tk[i].pos);
      }
    }
    let ret = null;
    if (tk[i] && tk[i].v === '->') {
      if (!tk[i + 1] || tk[i + 1].v === ':') throw new SigError('После -> нужен тип результата.', tk[i].pos);
      const r = parseTypeAt(tk, i + 1, end);
      ret = r.node; i = r.i;
    } else if (tk[i] && tk[i].v === '-') {
      throw new SigError('Стрелка пишется двумя символами: ->.', tk[i].pos);
    } else if (tk[i] && tk[i].t === 'name') {
      throw new SigError('Перед типом результата нужна стрелка ->.', tk[i].pos);
    }
    if (!tk[i]) throw new SigError('В конце подписи нужно двоеточие.', end);
    if (tk[i].v !== ':') throw new SigError('После подписи — только двоеточие.', tk[i].pos);
    if (tk[i + 1]) throw new SigError('После двоеточия в этой строке ничего не пишется.', tk[i + 1].pos);
    const seen = new Set();
    params.forEach(p => {
      if (seen.has(p.name)) throw new SigError(`SyntaxError: duplicate argument '${p.name}' in function definition — два параметра с одним именем.`, p.pos);
      seen.add(p.name);
    });
    checkDefaults(params.map(p => ({ name: p.name, hasDefault: p.def !== null })));
    return { name: tk[1].v, params, ret };
  };

  /* Python не принимает параметр без умолчания после параметра с умолчанием. */
  const checkDefaults = list => {
    let seenDefault = null;
    list.forEach(p => {
      if (p.hasDefault) seenDefault = seenDefault || p.name;
      else if (seenDefault) throw new SigError(`SyntaxError: parameter without a default follows parameter with a default — параметр ${p.name} без значения по умолчанию стоит после ${seenDefault}, у которого оно есть.`, 0);
    });
  };

  /* ── Чтение по-русски ── */
  const NOM = { int: 'целое число', float: 'дробное число', str: 'строка', bool: 'True или False', None: 'None', date: 'дата (date)', Path: 'путь к файлу (Path)' };
  const GEN = { int: 'целых чисел', float: 'дробных чисел', str: 'строк', bool: 'значений True и False', None: 'значений None', date: 'дат (date)', Path: 'путей к файлам (Path)' };
  const WORD = { list: 'список', set: 'множество', dict: 'словарь', tuple: 'кортеж' };

  const read = node => {
    if (!node) return 'тип не указан';
    if (node.k === 'union') return node.items.map(read).join(' или ');
    if (node.k === 'name') return NOM[node.n] || `${WORD[node.n]} (что внутри, не указано)`;
    const a = node.args;
    if (node.n === 'list' || node.n === 'set') return `${WORD[node.n]} ${gen(a[0])}`;
    if (node.n === 'dict') return `словарь (ключ — ${read(a[0])}, значение — ${read(a[1])})`;
    if (a.length === 2 && a[1].k === 'ell') return `кортеж любой длины из ${gen(a[0])}`;
    return `кортеж из ${a.length} ${a.length === 1 ? 'элемента' : 'элементов'}: ${a.map(read).join(', ')}`;
  };
  const gen = node => {
    if (node.k === 'name' && GEN[node.n]) return GEN[node.n];
    return `элементов вида «${read(node)}»`;
  };

  return { SigError, parseType, parseDef, canon, canonText, read, checkDefaults };
})();
