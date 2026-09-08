// Занятие 2 · счета за операции: одна связь в двух формах
//
// Коллекции: resumes_embed (компания внутри резюме), resumes_ref + companies
// (компания вынесена), interviews (вторая копия названия компании).
//
// Запуск:
//   docker exec -i hh-mongo mongosh hh --quiet --file /dev/stdin < queries.mongodb.js
//   mongosh hh --quiet --file queries.mongodb.js          (сервер стоит в системе)
//
// Числа в комментариях — с преподавательского стенда на данных из seed/.
// Миллисекунды у вас будут свои, число документов должно совпасть.

const line = t => print("\n=== " + t + " ===");
const ms = f => { const t0 = Date.now(); const v = f(); return [Date.now() - t0, v]; };

line("что вообще лежит в базе");
["companies", "resumes_embed", "resumes_ref", "interviews"].forEach(c =>
  print(`${c.padEnd(14)} документов: ${String(db[c].countDocuments()).padStart(4)}  средний размер: ${Math.round(db[c].stats().size / Math.max(1, db[c].countDocuments()))} байт`));
// ожидается 8 / 150 / 150 / 60 и 145 / 866 / 626 / 241 байт

line("счёт № 1 · прочитать карточку резюме с названиями компаний");
const ids = db.resumes_ref.find({}, { _id: 1 }).toArray().map(d => d._id);
const N = 1000;
const [te] = ms(() => { for (let i = 0; i < N; i++) db.resumes_embed.findOne({ _id: ids[i % ids.length] }); });
const [tr] = ms(() => { for (let i = 0; i < N; i++) {
  const d = db.resumes_ref.findOne({ _id: ids[i % ids.length] });
  db.companies.find({ _id: { $in: d.experience.map(x => x.company_id) } }).toArray();
} });
const [tl] = ms(() => { for (let i = 0; i < N; i++)
  db.resumes_ref.aggregate([{ $match: { _id: ids[i % ids.length] } },
    { $lookup: { from: "companies", localField: "experience.company_id", foreignField: "_id", as: "c" } }]).toArray(); });
print(`${N} карточек: вложение ${te} мс | ссылка двумя запросами ${tr} мс | ссылка через $lookup ${tl} мс`);
print(`на карточку:  вложение ${(te/N).toFixed(2)} мс | два запроса ${(tr/N).toFixed(2)} мс | $lookup ${(tl/N).toFixed(2)} мс`);
// ожидается примерно 0,18 | 0,31 | 0,19 мс

line("счёт № 2 · отчёт по отрасли компании");
const [t1, v1] = ms(() => db.resumes_embed.countDocuments({ "experience.company.industry": "e-commerce" }));
const [t2, v2] = ms(() => {
  const cids = db.companies.find({ industry: "e-commerce" }, { _id: 1 }).toArray().map(d => d._id);
  return [cids.length, db.resumes_ref.countDocuments({ "experience.company_id": { $in: cids } })];
});
print(`вложение: один фильтр  → ${v1} резюме, ${t1} мс`);
print(`ссылка:   два шага     → ${v2[0]} компаний → ${v2[1]} резюме, ${t2} мс`);

line("счёт № 3 · заявка CR-014: компания сменила название");
print("копия названия лежит в resumes_embed:", db.resumes_embed.countDocuments({ "experience.company.name": "Ozon Tech" }));
print("копия названия лежит в interviews:  ", db.interviews.countDocuments({ "company.name": "Ozon Tech" }));
print("в справочнике companies:            ", db.companies.countDocuments({ name: "Ozon Tech" }));
const [t3, r3] = ms(() => db.resumes_embed.updateMany(
  { "experience.company.name": "Ozon Tech" },
  { $set: { "experience.$[e].company.name": "Ozon Технологии" } },
  { arrayFilters: [ { "e.company.name": "Ozon Tech" } ] }));
print(`\nвложение · updateMany: изменено ${r3.modifiedCount} документов за ${t3} мс`);
const [t4, r4] = ms(() => db.companies.updateOne({ _id: "c-ozon" }, { $set: { name: "Ozon Технологии" } }));
print(`ссылка   · updateOne:  изменено ${r4.modifiedCount} документ за ${t4} мс`);
print("\nа теперь то, ради чего всё считалось:");
print("приглашений со старым названием осталось:", db.interviews.countDocuments({ "company.name": "Ozon Tech" }));
// ожидается 5 — забытая копия

line("размер: во что обходится дублирование");
const size = c => db[c].stats().size;
print(`вложение: ${size("resumes_embed")} байт`);
print(`ссылка:   ${size("resumes_ref")} + ${size("companies")} = ${size("resumes_ref") + size("companies")} байт`);
print(`разница:  ×${(size("resumes_embed") / (size("resumes_ref") + size("companies"))).toFixed(2)}`);

line("кардинальность: сколько резюме ссылается на одну компанию");
db.resumes_ref.aggregate([
  { $unwind: "$experience" },
  { $group: { _id: "$experience.company_id", n: { $sum: 1 } } },
  { $sort: { n: -1 } }
]).forEach(d => print(`  ${String(d._id).padEnd(11)} ${d.n}`));
print("средняя длина experience:",
  db.resumes_ref.aggregate([{ $project: { n: { $size: "$experience" } } },
    { $group: { _id: null, a: { $avg: "$n" } } }]).toArray()[0].a.toFixed(2));

print("\nЧтобы вернуть базу в исходное состояние, перезалейте seed/ через mongoimport --drop.");
