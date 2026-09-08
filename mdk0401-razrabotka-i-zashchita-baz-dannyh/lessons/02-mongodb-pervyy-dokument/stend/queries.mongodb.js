// Запросы занятия 1 · коллекция hh.resumes
//
// Тот же набор фильтров, что на экранах колоды, только исполняемый.
// Числа в комментариях — по восьми документам из seed/resumes.json;
// ваш собственный документ может добавить к любому из них единицу.
//
// Как запустить:
//   docker exec -i hh-mongo mongosh hh --quiet --file /dev/stdin < queries.mongodb.js
//   mongosh hh --quiet --file queries.mongodb.js        (сервер стоит в системе)
//   (или открыть файл в VS Code с расширением MongoDB и нажать ▶)
//
// Ключ --file обязателен: без него mongosh читает поток как ввод в оболочку
// и рвёт запросы, записанные в несколько строк.
//
// В Compass эти же фильтры вставляются в строку FILTER — фигурные скобки
// вместе с содержимым, без слова db.resumes.find.

const total = db.resumes.countDocuments();
print(`\nВсего документов в коллекции: ${total}\n`);

// 1. Точное совпадение строки — ожидается 4
print("1. { city: 'Ярославль' } →", db.resumes.countDocuments({ city: "Ярославль" }));

// 2. Поле внутри вложенного объекта, путь через точку — ожидается 4
print("2. { 'education.level': 'СПО' } →", db.resumes.countDocuments({ "education.level": "СПО" }));

// 3. Элемент массива: индекс не пишется, условие проверяется по каждому — ожидается 2
print("3. { skills: 'MongoDB' } →", db.resumes.countDocuments({ skills: "MongoDB" }));

// 4. Оператор сравнения — ожидается 4
print("4. { salary: { $gt: 100000 } } →", db.resumes.countDocuments({ salary: { $gt: 100000 } }));

// 5. Наличие поля — ожидается 2
print("5. { portfolio: { $exists: true } } →", db.resumes.countDocuments({ portfolio: { $exists: true } }));

// 5а. Обратный случай: поля нет — ожидается 6
print("5а. { portfolio: { $exists: false } } →", db.resumes.countDocuments({ portfolio: { $exists: false } }));

// 5б. Не то же самое: поле есть и равно null — ожидается 0
print("5б. { portfolio: null } находит и отсутствие поля тоже →",
      db.resumes.countDocuments({ portfolio: null }));

// --- Options в Compass: проекция, сортировка, ограничение ---------------
// Кнопка Options рядом со строкой запроса — это те же аргументы find.
print("\nЗарплаты по убыванию, только два поля:");
db.resumes
  .find({ salary: { $gt: 100000 } }, { fio: 1, salary: 1, _id: 0 })
  .sort({ salary: -1 })
  .forEach(d => print(`   ${d.fio} — ${d.salary}`));

// --- Типы: цифра в кавычках это строка ----------------------------------
// Сравнение чисел по строке не срабатывает: типы разные, приведения нет.
print("\n{ salary: { $gt: '100000' } } →",
      db.resumes.countDocuments({ salary: { $gt: "100000" } }), "(строка вместо числа)");

// --- Сколько весит документ ---------------------------------------------
// Тот же $bsonSize, что на экране 8, только по настоящим резюме.
print("\nРазмер документов в байтах:");
db.resumes
  .aggregate([{ $project: { fio: 1, size: { $bsonSize: "$$ROOT" } } }])
  .forEach(d => print(`   ${String(d.size).padStart(4)} — ${d.fio}`));

// --- ObjectId: 12 байт, первые четыре — время вставки -------------------
const first = db.resumes.findOne();
print("\n_id первого документа:", first._id.toString());
print("время вставки из этого же _id:", first._id.getTimestamp().toISOString());

// --- Сломанный запрос ----------------------------------------------------
// Раскомментируйте строку и запустите: строка без кавычек — не значение,
// а имя переменной, которой нет. Ошибка разбора приходит до сервера,
// поэтому она не то же самое, что пустой результат.
// print(db.resumes.countDocuments({ city: Ярославль }));
