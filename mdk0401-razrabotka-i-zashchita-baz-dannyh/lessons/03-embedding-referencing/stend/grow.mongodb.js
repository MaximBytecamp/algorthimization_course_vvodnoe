// Занятие 2 · стена 16 МБ: доводим встроенный массив до предела
//
//   docker exec -i hh-mongo mongosh hh --quiet --file /dev/stdin < grow.mongodb.js
//
// Скрипт делает три вещи: показывает рост документа вакансии по мере
// добавления откликов, пробует вставить документ за пределом и дописывает
// отклики по тысяче, пока сервер не откажет. Ошибка здесь — ожидаемый
// результат, а не поломка стенда.

function response(i) {
  return { resume_id: "r-" + String(i % 150 + 1).padStart(3, "0"),
           at: new Date(1757000000000 + i * 60000),
           cover: "Здравствуйте! Готов приступить, опыт по стеку есть.",
           status: i % 3 === 0 ? "новый" : "просмотрен", score: (i % 97) / 10 };
}
function vacancy(n) {
  return { _id: "v-" + n, title: "Инженер сопровождения БД", city: "Ярославль",
           salary: { from: 80000, to: 120000 }, published: new Date(1756900000000),
           responses: Array.from({ length: n }, (_, i) => response(i)) };
}

print("предел документа по словам сервера:", db.hello().maxBsonObjectSize, "байт\n");

print("откликов | размер документа, байт");
for (const n of [0, 1, 10, 100, 1000, 10000, 50000]) {
  const size = db.aggregate([{ $documents: [ vacancy(n) ] },
                             { $project: { s: { $bsonSize: "$$ROOT" } } }]).toArray()[0].s;
  print(String(n).padStart(8), "|", String(size).padStart(10), n ? `· ~${Math.round(size / n)} байт на отклик` : "· пустая вакансия");
}

print("\n--- пробуем вставить документ за пределом ---");
db.vacancies.drop();
try { db.vacancies.insertOne(vacancy(87000)); print("вставился (такого быть не должно)"); }
catch (err) { print(err.codeName || err.code, "|", String(err.message).slice(0, 200)); }
print("документов в коллекции:", db.vacancies.countDocuments(), "— вставка не прошла частично, она не прошла вообще");

print("\n--- дописываем по тысяче, пока сервер не откажет ---");
db.vacancies.insertOne(vacancy(0));
let added = 0;
try {
  for (let i = 0; i < 200; i++) {
    db.vacancies.updateOne({ _id: "v-0" },
      { $push: { responses: { $each: Array.from({ length: 1000 }, (_, k) => response(i * 1000 + k)) } } });
    added += 1000;
  }
} catch (err) { print("остановились на", added, "→", err.codeName || err.code, "|", String(err.message).slice(0, 160)); }
const s = db.vacancies.aggregate([{ $match: { _id: "v-0" } },
  { $project: { n: { $size: "$responses" }, s: { $bsonSize: "$$ROOT" } } }]).toArray()[0];
print(`в документе осталось ${s.n} откликов и ${s.s} байт — вакансия читается, но новый отклик уже не примет`);
db.vacancies.drop();
print("\nколлекция vacancies удалена: она нужна была только ради отказа.");
