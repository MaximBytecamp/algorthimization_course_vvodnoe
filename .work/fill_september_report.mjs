import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const input = path.join(root, "Отчет_по_дисциплинам_за_сентябрь_1-4_курс.xlsx");
const threadId = process.env.CODEX_THREAD_ID || "september-report";
const outputDir = path.join(root, "outputs", threadId);
const output = path.join(outputDir, "Отчет_по_дисциплинам_за_сентябрь_заполненный.xlsx");
const work = fs.mkdtempSync(path.join(os.tmpdir(), "september-report-"));

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { encoding: "utf8", ...options });
  if (result.status !== 0) {
    throw new Error(`${command} failed: ${result.stderr || result.stdout}`);
  }
  return result.stdout;
}

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function replaceCell(xml, ref, text) {
  const escaped = escapeXml(text);
  const pattern = new RegExp(`<x:c r="${ref}"([^>]*)\\s*/>`);
  const fullPattern = new RegExp(`<x:c r="${ref}"([^>]*)>.*?<\\/x:c>`);
  const makeReplacement = (_match, rawAttributes) => {
    const attributes = rawAttributes.replace(/\s+t="[^"]*"/g, "");
    return `<x:c r="${ref}"${attributes} t="inlineStr"><x:is><x:t xml:space="preserve">${escaped}</x:t></x:is></x:c>`;
  };
  if (pattern.test(xml)) return xml.replace(pattern, makeReplacement);
  if (fullPattern.test(xml)) return xml.replace(fullPattern, makeReplacement);
  throw new Error(`Cell ${ref} not found`);
}

function setRowHeight(xml, row, height) {
  const pattern = new RegExp(`<x:row r="${row}"[^>]*>`);
  if (!pattern.test(xml)) throw new Error(`Row ${row} not found`);
  return xml.replace(pattern, (tag) => {
    let updated = tag.replace(/ ht="[^"]*"/, ` ht="${height}"`);
    if (!/ customHeight="/.test(updated)) {
      updated = updated.replace(/>$/, ' customHeight="1">');
    }
    return updated;
  });
}

const commonRepo = "https://github.com/MaximBytecamp/algorthimization_course_vvodnoe/tree/main";

const sheets = {
  1: [
    {
      row: 2,
      discipline: "ДУП.02 «Введение в язык программирования Python»",
      repo: `${commonRepo}/dup02-vvedenie-v-python`,
      learned: "• Настроили рабочее место в VS Code и запуск Python 3.12.\n• Изучили переменные, присваивание, имена и базовые типы данных.\n• Освоили print(), sep/end, input(), int()/float() и множественное присваивание.\n• Научились читать трассировку и различать NameError, SyntaxError, TypeError и ValueError; закрепили темы задачами и двумя проверочными работами.",
      changed: "Сентябрьский блок пересобран как единый маршрут «справочник → задачи → проверка». Добавлены пошаговый старт в VS Code, запускаемые примеры на Python 3.12, разбор типичных ошибок и две автоматизированные формы контроля. Цель — сразу связать синтаксис с фактическим выводом программы и самопроверкой.",
      height: 225,
    },
  ],
  2: [
    {
      row: 2,
      discipline: "ОП.03 «Информационные технологии»",
      repo: "https://github.com/MaximBytecamp/funnel-project-template",
      learned: "• Построили карту цифровой воронки и нашли точки потери данных.\n• Освоили UTM-метки, единые имена и проверку запросов в DevTools Network.\n• Разобрали структуру GA4: аккаунт, ресурс, поток данных, Measurement ID.\n• Создали свой GitHub-репозиторий, опубликовали сайт на Vercel, установили Google Tag.\n• Настроили и проверили generate_lead/cta_click, параметры, DebugView, Custom Dimensions и Key Events.",
      changed: "Изменена последовательность первых тем: перед полной настройкой событий добавлены устройство GA4, публикация сайта на Vercel и установка Google Tag. Тема GTM проведена в контексте собственного опубликованного сайта и проверки через Tag Assistant, Realtime и DebugView. Причина — каждый шаг должен давать проверяемый результат на проекте студента.",
      height: 260,
    },
    {
      row: 3,
      discipline: "ОП.05 «Операционные системы и среды»",
      repo: `${commonRepo}/op05-operacionnye-sistemy-i-sredy`,
      learned: "• Установили Ubuntu Desktop в VirtualBox, настроили ресурсы, сеть, обновления и снимок VM.\n• Разобрали назначение, функции, историю и классификацию операционных систем.\n• Изучили дерево Linux, FHS, пути, inode, ссылки, монтирование, /proc и /sys.\n• Освоили mkdir/touch/cp/mv/rm, маски, find/locate, man/--help и безопасную работу с файлами.\n• Разобрали UID/GID, /etc/passwd, /etc/shadow, /etc/group, sudo, права доступа и setgid.",
      changed: "Сентябрьский блок выстроен от практического результата к теории: сначала безопасная виртуальная машина, затем устройство ОС и системные операции. Обзорные темы дополнены реальными снимками Ubuntu, командами, скриптами подготовки/проверки, практикой FHS и отчётами. Причина — перевести темы в набор воспроизводимых лабораторных работ.",
      height: 250,
    },
    {
      row: 4,
      discipline: "МДК.01.01 «Разработка программных модулей»",
      repo: "https://github.com/MaximBytecamp/backend-starter-template",
      learned: "• Разобрали маршрут запроса в backend и структуру годового проекта.\n• Освоили .venv, выбор интерпретатора, PATH и воспроизводимый запус.\n• Изучили модули, пакеты, __name__, __init__.py, импорты и границы файлов.\n• Собрали структуру проекта из разрозненных файлов и разделили большой main.py на модули.\n• Применили аннотации типов, Pylance/mypy, докстринги, PEP 257, Google style и Ruff.",
      changed: "Первые темы КТП укрупнены в единый Python bridge перед FastAPI: окружение, модульные границы, типизация и документация. Добавлены интерактивные книги, ветки Python/Go, два практикума по сборке проекта, проверки запуском/тестами и автопроверка. Причина — выровнять базовую подготовку и не переносить ошибки структуры в backend-проект.",
      height: 255,
    },
  ],
  3: [
    {
      row: 2,
      discipline: "ОП.04 «Основы алгоритмизации и программирования»",
      repo: "https://github.com/MaximBytecamp/algo-portfolio-template",
      learned: "• Разобрали процесс решения задачи и формат алгоритмического собеседования.\n• Научились считать операции, записывать T(n), определять O(1), O(log n), O(n), O(n log n), O(n²).\n• Проводили воспроизводимые замеры perf_counter/timeit, брали медиану, измеряли память tracemalloc, сохраняли CSV и графики.\n• Формулировали контракт, граничные случаи и инвариант; делали dry run.\n• Освоили массивы: индексы, полуинтервал [l, r), off-by-one, in-place, инвариант прохода и амортизированный append.",
      changed: "Содержание первых тем КТП сохранено, но подача усилена практикой: вместо одиночного замера — серии, CSV и графики; вместо абстрактного разбора — запускаемый код, тесты, тренажёры и практикум с ошибками. Вводная и диагностическая части объединены; работа с Git, complexity notes и review встроена в каждую тему. Причина — оценивать не запоминание обозначений, а доказуемое решение задачи.",
      height: 270,
    },
  ],
  4: [
    {
      row: 2,
      discipline: "МДК.04.01 «Технология разработки и защиты баз данных»",
      repo: "https://github.com/MaximBytecamp/data-platform-template",
      learned: "• Разобрали архитектуру data platform: источник истины, документную/аналитическую проекции, кэш и брокер.\n• Подняли MongoDB в Docker, подключились через Compass, создали базу, коллекцию и первый документ.\n• Изучили BSON, типы значений, вложенные поля и структуру 12-байтового ObjectId.\n• Выполнили вставку и базовые запросы: фильтр, проекцию, сортировку и подсчёт результа.\n• Закрепили модуль практикой в репозитории и проверочной работой.",
      changed: "Вводные архитектурные темы КТП даны компактно как карта годовой платформы, а практическая часть начата сразу с MongoDB. Занятие по документной модели расширено до полного маршрута: Docker/Compass → первый документ → BSON/ObjectId → пять проверяемых запросов. Embedding/referencing и schema validation оставлены следующими отдельными темами. Причина — сначала добиться у всех воспроизводимого стенда и первых запросов.",
      height: 255,
    },
    {
      row: 3,
      discipline: "«Стандартизация, сертификация и техническое документоведение»",
      repo: "https://github.com/MaximBytecamp/api-standard-template",
      learned: "• Рассмотрели API как публичный контракт между клиентом и сервером.\n• Разобрали HTTP-методы, статусы, ресурсы, REST, Problem Details и версионирование.\n• Читали и изменяли OpenAPI-контракт, проверяли его в Swagger UI и ReDoc.\n• Применили API Style Guide, Spectral, oasdiff и контрактные тесты.\n• Освоили структуру репозитория: README, CHANGELOG, SECURITY, CONTRIBUTING, ADR, Issue/PR templates, CODEOWNERS и CI-проверки.",
      changed: "Сентябрьская тема пересобрана из обзора стандартов в практику на учебном Service Desk API. Каждое правило связано с артефактом в репозитории и автоматической проверкой: OpenAPI, Spectral, oasdiff, контрактные тесты и CI. Добавлены версионирование, Problem Details, security-и release-документы и шаблоны GitHub. Причина — показать стандарт как исполняемое и проверяемое правило, а не как перечень терминов.",
      height: 245,
    },
  ],
};

fs.mkdirSync(outputDir, { recursive: true });
run("unzip", ["-q", input, "-d", work]);

for (const [sheetNumber, rows] of Object.entries(sheets)) {
  const file = path.join(work, "xl", "worksheets", `sheet${sheetNumber}.xml`);
  let xml = fs.readFileSync(file, "utf8");
  for (const item of rows) {
    xml = replaceCell(xml, `A${item.row}`, item.discipline);
    xml = replaceCell(xml, `B${item.row}`, item.repo);
    xml = replaceCell(xml, `C${item.row}`, item.learned);
    xml = replaceCell(xml, `D${item.row}`, item.changed);
    xml = setRowHeight(xml, item.row, item.height);
  }
  xml = xml.replace(
    '<x:worksheet xmlns:x="http://schemas.openxmlformats.org/spreadsheetml/2006/main">',
    '<x:worksheet xmlns:x="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">',
  );
  const hyperlinks = rows
    .map((item, index) => `<x:hyperlink ref="B${item.row}" r:id="rId${index + 1}"/>`)
    .join("");
  xml = xml.replace("<x:pageMargins", `<x:hyperlinks>${hyperlinks}</x:hyperlinks><x:pageMargins`);
  fs.writeFileSync(file, xml, "utf8");

  const relsDir = path.join(work, "xl", "worksheets", "_rels");
  fs.mkdirSync(relsDir, { recursive: true });
  const relationships = rows
    .map(
      (item, index) =>
        `<Relationship Id="rId${index + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="${escapeXml(item.repo)}" TargetMode="External"/>`,
    )
    .join("");
  fs.writeFileSync(
    path.join(relsDir, `sheet${sheetNumber}.xml.rels`),
    `<?xml version="1.0" encoding="utf-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${relationships}</Relationships>`,
    "utf8",
  );
}

if (fs.existsSync(output)) fs.unlinkSync(output);
run("zip", ["-q", "-r", output, "."], { cwd: work });

const testOutput = run("unzip", ["-t", output]);
if (!testOutput.includes("No errors detected")) {
  throw new Error(`Archive verification did not pass: ${testOutput}`);
}

for (const [sheetNumber, rows] of Object.entries(sheets)) {
  const file = path.join(work, "xl", "worksheets", `sheet${sheetNumber}.xml`);
  const xml = fs.readFileSync(file, "utf8");
  for (const item of rows) {
    for (const col of ["A", "B", "C", "D"]) {
      if (!new RegExp(`<x:c r="${col}${item.row}"[^>]* t="inlineStr">`).test(xml)) {
        throw new Error(`Verification failed for ${col}${item.row}`);
      }
    }
  }
}

console.log(output);
