/* Разбор подписи функции Go и её типов в браузере.

   SIG.parseType(text)  → узел типа или SigError
   SIG.parseFunc(text)  → { name, params: [{ name, type }], rets: [узел] }
   SIG.canon(node)      → строка для сравнения
   SIG.read(node)       → как тип читается по-русски

   Поддерживается то, что нужно в этой работе: простые типы, срезы []T,
   словари map[K]V и time.Time. Ошибки записи описываются по-русски с местом. */
window.SIG = (() => {
  class SigError extends Error {
    constructor(msg, pos) { super(msg); this.pos = pos; }
  }

  const SIMPLE = ['int', 'float64', 'string', 'bool', 'error', 'time.Time'];
  const LIST = 'int, float64, string, bool, error, []тип, map[ключ]значение, time.Time';

  /* Частые описки и их объяснение. Многие приходят из Python. */
  const TYPO = {
    str: 'Тип строки в Go называется string.',
    float: 'Дробное число в Go — float64.',
    float32: 'В этой работе дробные числа — float64.',
    double: 'Дробное число в Go — float64.',
    int64: 'В этой работе целые числа — int.',
    int32: 'В этой работе целые числа — int.',
    uint: 'В этой работе целые числа — int.',
    integer: 'Тип целого числа называется int.',
    number: 'Для числа есть два типа: int — целое, float64 — дробное.',
    boolean: 'Тип «да или нет» называется bool.',
    Int: 'Имена встроенных типов пишутся с маленькой буквы: int.',
    Float64: 'Имена встроенных типов пишутся с маленькой буквы: float64.',
    String: 'Имена встроенных типов пишутся с маленькой буквы: string.',
    Bool: 'Имена встроенных типов пишутся с маленькой буквы: bool.',
    Error: 'Тип ошибки пишется с маленькой буквы: error.',
    err: 'Тип ошибки называется error. err — обычное имя переменной для неё.',
    list: 'Списка в Go нет. Набор значений одного типа — срез: []int.',
    array: 'В этой работе набор значений одного типа — срез: []int.',
    slice: 'Срез записывается скобками перед типом элементов: []int.',
    dict: 'Словарь в Go записывается как map[тип ключа]тип значения.',
    Map: 'Слово map пишется с маленькой буквы.',
    tuple: 'Кортежей в Go нет. Несколько результатов перечисляют в скобках: (string, bool).',
    None: 'None в Go нет. У функции без результата после скобки ничего не пишут.',
    nil: 'nil — значение, а не тип. У функции без результата после скобки ничего не пишут.',
    void: 'Слова void в Go нет. У функции без результата после скобки ничего не пишут.',
    Time: 'Тип времени пишется вместе с именем пакета: time.Time.',
    'time.time': 'Тип времени называется time.Time: Time с заглавной буквы.',
    date: 'Для даты в Go берут тип time.Time.',
    any: 'Тип any в этой работе не используется: у каждого значения назван точный тип.',
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
        while (j < text.length && /[\wЀ-ӿ.]/.test(text[j])) j++;
        while (text[j - 1] === '.') j--;
        out.push({ t: 'name', v: text.slice(i, j), pos: i });
        i = j; continue;
      }
      if (text.startsWith('->', i)) throw new SigError('Стрелки в Go нет: тип результата пишется сразу после закрывающей скобки.', i);
      if (text.startsWith('...', i)) throw new SigError('Запись с многоточием в этой работе не используется: набор значений передают срезом, например []string.', i);
      if (text.startsWith('[]', i)) { out.push({ t: 'op', v: '[]', pos: i }); i += 2; continue; }
      if (ch === '{') {
        if (text.slice(i + 1).trim()) throw new SigError('Тело функции писать не нужно: после { в этой строке ничего нет.', i + 1);
        out.push({ t: 'op', v: ch, pos: i }); i++; continue;
      }
      if ('()[],'.includes(ch)) { out.push({ t: 'op', v: ch, pos: i }); i++; continue; }
      if (ch === ']') { out.push({ t: 'op', v: ']', pos: i }); i++; continue; }
      if (ch === ':') throw new SigError('Двоеточия в подписи Go нет: тип пишется после имени через пробел — name string.', i);
      if (ch === '=') throw new SigError('Значений по умолчанию в Go нет: знак = в подписи не пишется.', i);
      if (ch === '*') throw new SigError('Указатели в этой работе не используются: звёздочка не нужна.', i);
      if (ch === '|') throw new SigError('Вариантов через | у типа в Go нет. Два результата перечисляют в скобках: (int, error).', i);
      if (ch === '}') throw new SigError('Тело функции писать не нужно: строка заканчивается типом результата или скобкой {.', i);
      throw new SigError(`Символ «${ch}» в подписи не используется.`, i);
    }
    return out;
  };

  /* ── Типы ── */
  const isTypeStart = t => !!t && (t.v === '[]' || t.v === '[' || (t.t === 'name' && (t.v === 'map' || SIMPLE.includes(t.v) || TYPO[t.v])));

  const parseTypeAt = (tk, i, end) => {
    const t = tk[i];
    if (!t) throw new SigError('Здесь должен быть тип.', end);
    if (t.v === '[]') {
      const r = parseTypeAt(tk, i + 1, end);
      return { node: { k: 'slice', el: r.node }, i: r.i };
    }
    if (t.v === '[') throw new SigError('У среза скобки пустые и стоят перед типом: []int.', t.pos);
    if (t.t !== 'name') throw new SigError('Здесь должен быть тип.', t.pos);
    if (t.v === 'map') {
      if (!tk[i + 1] || tk[i + 1].v !== '[') {
        if (tk[i + 1] && tk[i + 1].v === '[]') throw new SigError('В скобках после map нужен тип ключа: map[string]int.', tk[i + 1].pos);
        throw new SigError('После map в квадратных скобках пишется тип ключа: map[string]int.', tk[i + 1] ? tk[i + 1].pos : end);
      }
      const key = parseTypeAt(tk, i + 2, end);
      const close = tk[key.i];
      if (close && close.v === ',') throw new SigError('В map запятой нет: тип ключа в скобках, тип значения — сразу после них, map[string]int.', close.pos);
      if (!close || close.v !== ']') throw new SigError('Не закрыта квадратная скобка после типа ключа.', close ? close.pos : end);
      if (!isTypeStart(tk[key.i + 1])) throw new SigError('После скобки ] нужен тип значения: map[string]int.', tk[key.i + 1] ? tk[key.i + 1].pos : end);
      const val = parseTypeAt(tk, key.i + 1, end);
      return { node: { k: 'map', key: key.node, val: val.node }, i: val.i };
    }
    if (TYPO[t.v]) throw new SigError(TYPO[t.v], t.pos);
    if (!SIMPLE.includes(t.v)) throw new SigError(`Типа ${t.v} в этой работе нет. Типы: ${LIST}.`, t.pos);
    const nxt = tk[i + 1];
    if (nxt && (nxt.v === '[]' || nxt.v === '[')) throw new SigError(`Квадратные скобки в Go пишутся перед типом: []${t.v}.`, nxt.pos);
    return { node: { k: 'name', n: t.v }, i: i + 1 };
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
    if (node.k === 'slice') return '[]' + canon(node.el);
    return `map[${canon(node.key)}]${canon(node.val)}`;
  };
  const canonText = text => canon(parseType(text));

  /* ── Подпись ── */
  const parseFunc = raw => {
    const text = raw.trim();
    if (!text) throw new SigError('Строка пуста.', 0);
    const tk = tokenize(text);
    const end = text.length;
    if (tk[0].v === 'def') throw new SigError('В Go подпись начинается со слова func.', 0);
    if (tk[0].v !== 'func') throw new SigError('Подпись начинается со слова func.', 0);
    if (!tk[1] || tk[1].t !== 'name') throw new SigError('После func нужно имя функции.', tk[1] ? tk[1].pos : end);
    if (tk[1].v.includes('.')) throw new SigError('В имени функции точки нет.', tk[1].pos);
    if (!tk[2] || tk[2].v !== '(') throw new SigError('После имени функции нужна открывающая скобка (.', tk[2] ? tk[2].pos : end);

    /* Параметры: «имя тип» через запятую; запись «a, b int» даёт обоим тип int. */
    const params = [];
    let i = 3, waiting = [];
    if (tk[i] && tk[i].v === ')') i++;
    else {
      for (;;) {
        const p = tk[i];
        if (!p) throw new SigError('Не хватает закрывающей скобки ).', end);
        if (p.t !== 'name') throw new SigError('Здесь должно быть имя параметра.', p.pos);
        if (p.v === 'map' || SIMPLE.includes(p.v)) throw new SigError(`Перед типом ${p.v} нужно имя параметра: имя ${p.v}.`, p.pos);
        if (p.v.includes('.')) throw new SigError('В имени параметра точки нет.', p.pos);
        i++;
        const nxt = tk[i];
        if (nxt && (nxt.v === ',' || nxt.v === ')')) {
          waiting.push(p);
        } else {
          const r = parseTypeAt(tk, i, end);
          [...waiting, p].forEach(x => params.push({ name: x.v, type: r.node, pos: x.pos }));
          waiting = [];
          i = r.i;
        }
        if (tk[i] && tk[i].v === ',') { i++; continue; }
        if (tk[i] && tk[i].v === ')') { i++; break; }
        if (!tk[i]) throw new SigError('Не хватает закрывающей скобки ).', end);
        throw new SigError('Параметры разделяются запятой.', tk[i].pos);
      }
      if (waiting.length) throw new SigError(`У параметра ${waiting[waiting.length - 1].v} не указан тип: имя, затем тип через пробел.`, waiting[waiting.length - 1].pos);
    }

    /* Результаты: нет, один тип или список в скобках. */
    const rets = [];
    if (tk[i] && tk[i].v === '(') {
      let j = i + 1;
      if (tk[j] && tk[j].v === ')') throw new SigError('Пустые скобки результата не пишут: у функции без результата после параметров ничего нет.', tk[j].pos);
      for (;;) {
        const t = tk[j];
        if (!t) throw new SigError('Не хватает закрывающей скобки ) у результатов.', end);
        /* Именованный результат «n int»: имя пропускается, тип учитывается. */
        if (t.t === 'name' && t.v !== 'map' && !SIMPLE.includes(t.v) && isTypeStart(tk[j + 1])) j++;
        const r = parseTypeAt(tk, j, end);
        rets.push(r.node); j = r.i;
        if (tk[j] && tk[j].v === ',') { j++; continue; }
        if (tk[j] && tk[j].v === ')') { j++; break; }
        if (!tk[j]) throw new SigError('Не хватает закрывающей скобки ) у результатов.', end);
        throw new SigError('Результаты разделяются запятой.', tk[j].pos);
      }
      i = j;
    } else if (tk[i] && tk[i].v !== '{') {
      const r = parseTypeAt(tk, i, end);
      rets.push(r.node); i = r.i;
      if (tk[i] && tk[i].v === ',') throw new SigError('Несколько результатов берут в скобки: (string, bool).', tk[i].pos);
    }
    if (tk[i] && tk[i].v === '{') i++;
    if (tk[i]) throw new SigError('После подписи в этой строке ничего не пишется.', tk[i].pos);

    const seen = new Set();
    params.forEach(p => {
      if (seen.has(p.name)) throw new SigError(`${p.name} redeclared — два параметра с одним именем.`, p.pos);
      seen.add(p.name);
    });
    return { name: tk[1].v, params, rets };
  };

  /* ── Чтение по-русски ── */
  const NOM = { int: 'целое число', float64: 'дробное число', string: 'строка', bool: 'true или false', error: 'ошибка (error)', 'time.Time': 'момент времени (time.Time)' };
  const GEN = { int: 'целых чисел', float64: 'дробных чисел', string: 'строк', bool: 'значений true и false', error: 'ошибок', 'time.Time': 'моментов времени (time.Time)' };

  const read = node => {
    if (!node) return 'тип не указан';
    if (node.k === 'name') return NOM[node.n];
    if (node.k === 'slice') return `срез ${gen(node.el)}`;
    return `словарь (ключ — ${read(node.key)}, значение — ${read(node.val)})`;
  };
  const gen = node => (node.k === 'name' ? GEN[node.n] : `элементов вида «${read(node)}»`);

  /* Результаты целиком: нет, один, несколько по порядку. */
  const ORD = ['сначала', 'затем', 'затем', 'затем'];
  const readRets = list => {
    if (!list.length) return 'результата нет';
    if (list.length === 1) return read(list[0]);
    return `${list.length === 2 ? 'два значения' : list.length + ' значения'}: ` + list.map((n, i) => `${ORD[Math.min(i, 3)]} ${read(n)}`).join(', ');
  };

  return { SigError, parseType, parseFunc, canon, canonText, read, readRets };
})();
