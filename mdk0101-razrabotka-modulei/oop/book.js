(() => {
  'use strict';

  const STORAGE_KEY = 'oop-example-language';
  const languages = {
    py: {
      name: 'Python',
      codeClass: 'language-python',
      keywords: new Set('class def return if else elif for in not and or is None True False import from as with try except raise pass super lambda yield del assert async await match case'.split(' ')),
      tokens: /#[^\n]*|(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|\b\d+(?:\.\d+)?\b|\b[A-Za-z_]\w*\b/g,
    },
    go: {
      name: 'Go',
      codeClass: 'language-go',
      keywords: new Set('break default func interface select case defer go map struct chan else goto package switch const fallthrough if range type continue for import return var'.split(' ')),
      tokens: /\/\/[^\n]*|\/\*[\s\S]*?\*\/|`[^`]*`|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b\d+(?:\.\d+)?\b|\b[A-Za-z_]\w*\b/g,
    },
    rust: {
      name: 'Rust',
      codeClass: 'language-rust',
      keywords: new Set('as async await break const continue crate dyn else enum extern false fn for if impl in let loop match mod move mut pub ref return self Self static struct super trait true type unsafe use where while'.split(' ')),
      tokens: /\/\/[^\n]*|\/\*[\s\S]*?\*\/|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b\d+(?:\.\d+)?\b|\b[A-Za-z_]\w*\b/g,
    },
  };

  const normalizeLanguage = value => Object.hasOwn(languages, value) ? value : null;
  const languageTokens = element => (element.getAttribute('data-lang') || '')
    .trim()
    .split(/\s+/)
    .map(normalizeLanguage)
    .filter(Boolean);

  const readStoredLanguage = () => {
    try {
      return normalizeLanguage(localStorage.getItem(STORAGE_KEY));
    } catch {
      return null;
    }
  };

  const saveLanguage = language => {
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch {
      // Страница остаётся работоспособной, если хранилище заблокировано.
    }
  };

  const urlLanguage = normalizeLanguage(new URLSearchParams(window.location.search).get('lang'));
  let activeLanguage = urlLanguage || readStoredLanguage() || 'py';

  const isVisibleForLanguage = element => {
    for (let current = element; current; current = current.parentElement) {
      const choices = languageTokens(current);
      if (choices.length && !choices.includes(activeLanguage)) return false;
    }
    return true;
  };

  const findCodeLanguage = pre => {
    for (let current = pre; current; current = current.parentElement) {
      const choices = languageTokens(current);
      if (choices.length === 1) return choices[0];
    }
    const figure = pre.closest('figure.code');
    const run = figure && normalizeLanguage(figure.getAttribute('data-run'));
    if (run) return run;
    const code = pre.querySelector('code');
    if (code) {
      for (const language of Object.keys(languages)) {
        if (code.classList.contains(languages[language].codeClass)) return language;
      }
    }
    return activeLanguage;
  };

  const highlight = (pre, language) => {
    const source = pre.dataset.codeSource || pre.textContent;
    pre.dataset.codeSource = source;

    const grammar = languages[language];
    const code = document.createElement('code');
    code.className = grammar.codeClass;
    let position = 0;

    for (const match of source.matchAll(grammar.tokens)) {
      code.append(document.createTextNode(source.slice(position, match.index)));
      const value = match[0];
      const tokenClass = value.startsWith('//') || value.startsWith('/*') || value.startsWith('#')
        ? 'comment'
        : /^['"`]/.test(value)
          ? 'string'
          : /^\d/.test(value)
            ? 'number'
            : grammar.keywords.has(value)
              ? 'keyword'
              : '';
      if (tokenClass) {
        const token = document.createElement('span');
        token.className = `tok-${tokenClass}`;
        token.textContent = value;
        code.append(token);
      } else {
        code.append(document.createTextNode(value));
      }
      position = match.index + value.length;
    }
    code.append(document.createTextNode(source.slice(position)));
    pre.replaceChildren(code);
  };

  const selectCode = pre => {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(pre);
    selection.removeAllRanges();
    selection.addRange(range);
  };

  const ensureCopyButton = (pre, language) => {
    const figure = pre.closest('figure.code');
    if (!figure) return;
    let caption = figure.querySelector('figcaption');
    if (!caption) {
      caption = document.createElement('figcaption');
      figure.prepend(caption);
    }

    let button = caption.querySelector('.copy-code');
    let status = caption.querySelector('.copy-status');
    if (!button) {
      button = document.createElement('button');
      button.className = 'copy-code';
      button.type = 'button';
      button.textContent = 'Копировать';
      button.addEventListener('click', async () => {
        const source = pre.dataset.codeSource || pre.textContent;
        try {
          if (!navigator.clipboard?.writeText) throw new Error('Clipboard API недоступен');
          await navigator.clipboard.writeText(source);
          status.textContent = 'Код скопирован';
        } catch {
          selectCode(pre);
          status.textContent = 'Код выделен. Нажмите Ctrl+C или ⌘C';
        }
      });
      caption.append(button);
    }
    if (!status) {
      status = document.createElement('span');
      status.className = 'copy-status';
      status.setAttribute('role', 'status');
      caption.append(status);
    }
    button.dataset.language = language;
    button.setAttribute('aria-label', `Копировать пример на ${languages[language].name}`);
  };

  const prepareVisibleCodeBlocks = () => {
    document.querySelectorAll('figure.code pre').forEach(pre => {
      if (!isVisibleForLanguage(pre)) return;
      const language = findCodeLanguage(pre);
      highlight(pre, language);
      ensureCopyButton(pre, language);
    });
  };

  const syncLanguageControl = () => {
    document.documentElement.dataset.lang = activeLanguage;
    document.querySelectorAll('[data-lang-choice]').forEach(button => {
      const language = normalizeLanguage(button.getAttribute('data-lang-choice'));
      if (!language) return;
      button.setAttribute('aria-pressed', String(language === activeLanguage));
      button.addEventListener('click', () => {
        setLanguage(language);
        updateUrl(language);
      });
    });
  };

  const updateUrl = language => {
    const url = new URL(window.location.href);
    url.searchParams.set('lang', language);
    window.history.replaceState(null, '', url);
  };

  const setLanguage = language => {
    activeLanguage = language;
    saveLanguage(language);
    document.documentElement.dataset.lang = language;
    document.querySelectorAll('[data-lang-choice]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.getAttribute('data-lang-choice') === language));
    });
    prepareVisibleCodeBlocks();
  };

  syncLanguageControl();
  saveLanguage(activeLanguage);
  prepareVisibleCodeBlocks();
})();
